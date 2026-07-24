<?php

namespace App\Http\Controllers;

use App\Events\MessageRead;
use App\Events\NewConversationMessage;
use App\Events\TeamMessageSent;
use App\Models\User;
use App\Services\MessagingService;
use Binkode\ChatSystem\Models\Conversation;
use Binkode\ChatSystem\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeamMessagingController extends Controller
{
    public function __construct(private MessagingService $messaging) {}
    // ─── Page load ────────────────────────────────────────────────────────────

    public function index()
    {
        $user            = Auth::user();
        $conversationIds = $this->messaging->conversationIdsFor($user->id);
        $unreadMap       = $this->messaging->bulkUnreadCounts($conversationIds, $user->id);

        $conversations = Conversation::whereIn('id', $conversationIds)
            ->get()
            ->map(function (Conversation $conv) use ($user, $unreadMap) {
                $otherUserId = $this->messaging->otherParticipantId($conv->id, $user->id);
                $otherUser   = $otherUserId ? User::with('employee')->find($otherUserId) : null;
                $lastMessage = Message::where('conversation_id', $conv->id)
                    ->where('type', 'user')
                    ->latest()
                    ->first();

                return [
                    'id'           => $conv->id,
                    'other_user'   => $otherUser ? [
                        'id'              => $otherUser->id,
                        'name'            => $otherUser->name,
                        'email'           => $otherUser->email,
                        'profile_picture' => $otherUser->employee->profile_pic ?? null,
                    ] : null,
                    'last_message' => $lastMessage ? [
                        'id'         => $lastMessage->id,
                        'message'    => $lastMessage->message,
                        'sender_id'  => $lastMessage->user_id,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'unread_count' => $unreadMap[$conv->id] ?? 0,
                ];
            });

        $users = User::where('id', '!=', $user->id)
            ->with('employee')
            ->get()
            ->map(fn(User $u) => $this->formatUser($u));

        return Inertia::render('TeamMessaging/Index', [
            'conversations' => $conversations,
            'users'         => $users,
        ]);
    }

    // ─── Create conversation ──────────────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $user        = Auth::user();
        $otherUserId = (int) $request->user_id;

        if ($user->id === $otherUserId) {
            return response()->json(['error' => 'Cannot start a conversation with yourself.'], 400);
        }

        $existing = Conversation::whereHas('participants', fn($q) => $q->where('user_id', $user->id))
            ->whereHas('participants', fn($q) => $q->where('user_id', $otherUserId))
            ->where('type', 'private')
            ->first();

        if ($existing) {
            return response()->json(['conversation_id' => $existing->id]);
        }

        $conv = Conversation::create([
            'user_id' => $user->id,
            'name'    => $user->name . ' & ' . User::find($otherUserId)->name,
            'type'    => 'private',
        ]);

        DB::table('conversation_users')->insert([
            ['user_id' => $user->id,    'conversation_id' => $conv->id, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => $otherUserId, 'conversation_id' => $conv->id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        return response()->json(['conversation_id' => $conv->id]);
    }

    // ─── Load messages + mark read ────────────────────────────────────────────

    public function getMessages(Conversation $conversation)
    {
        $user = Auth::user();

        abort_unless($this->messaging->isParticipant($conversation->id, $user->id), 403);

        // Mark read in one bulk insert — returns newly read message IDs
        $newlyRead = $this->messaging->markConversationRead(
            $conversation->id,
            $user->id,
            get_class($user)
        );

        // Broadcast blue-tick update to the conversation channel so sender sees it instantly
        if (!empty($newlyRead)) {
            try {
                broadcast(new MessageRead($conversation->id, $user->id, $newlyRead));
            } catch (\Exception $e) {
                \Log::warning('[WS] MessageRead broadcast failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'messages' => $this->messaging->messagesForConversation($conversation->id),
        ]);
    }

    // ─── Send message ─────────────────────────────────────────────────────────

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate(['message' => 'required|string|max:5000']);

        $user = Auth::user();

        abort_unless($this->messaging->isParticipant($conversation->id, $user->id), 403);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id'         => $user->id,
            'message'         => $request->message,
            'type'            => 'user',
        ]);

        $payload     = $this->messaging->formatMessage($message);
        $recipientId = $this->messaging->otherParticipantId($conversation->id, $user->id);

        try {
            // 1. Push full message to the open conversation channel (both participants)
            broadcast(new TeamMessageSent($message));

            // 2. Push unread-count increment to recipient's personal channel (sidebar badge)
            if ($recipientId) {
                broadcast(new NewConversationMessage([
                    'conversation_id' => $conversation->id,
                    'sender_id'       => $user->id,
                    'sender_name'     => $user->name,
                    'message'         => $request->message,
                    'created_at'      => $message->created_at,
                ], $recipientId));
            }
        } catch (\Exception $e) {
            \Log::warning('[WS] sendMessage broadcast failed: ' . $e->getMessage());
        }

        // Return only the new message — not the full history
        return response()->json(['message' => $payload]);
    }

    // ─── Unread counts (lightweight polling fallback) ─────────────────────────

    public function unreadCounts()
    {
        $user  = Auth::user();
        $ids   = $this->messaging->conversationIdsFor($user->id);
        $counts = $this->messaging->bulkUnreadCounts($ids, $user->id);

        // Also return the latest unread message per conversation so the
        // frontend can show notification content without a separate request
        $previews = [];
        foreach ($ids as $convId) {
            if (($counts[$convId] ?? 0) > 0) {
                $latestUnread = Message::where('conversation_id', $convId)
                    ->where('user_id', '!=', $user->id)
                    ->whereNotExists(function ($q) use ($user) {
                        $q->select(DB::raw(1))
                          ->from('chat_events')
                          ->whereColumn('chat_events.made_id', 'messages.id')
                          ->where('chat_events.made_type', 'Binkode\ChatSystem\Models\Message')
                          ->where('chat_events.type', 'read')
                          ->where('chat_events.maker_id', $user->id)
                          ->where('chat_events.maker_type', get_class($user));
                    })
                    ->latest()
                    ->first();

                if ($latestUnread) {
                    $sender = User::find($latestUnread->user_id);
                    $previews[$convId] = [
                        'sender_id'   => $latestUnread->user_id,
                        'sender_name' => $sender?->name ?? 'Someone',
                        'sender_avatar' => $sender ? ($sender->employee->profile_pic ?? null) : null,
                        'message'     => $latestUnread->message,
                    ];
                }
            }
        }

        return response()->json([
            'unread_counts'   => $counts,
            'unread_previews' => $previews,
        ]);
    }

    // ─── Online users ─────────────────────────────────────────────────────────

    public function getOnlineUsers()
    {
        // Inactive cutoff — 30 minutes: user has an active session but not on chat page
        $sessionCutoff = now()->subMinutes(30)->getTimestamp();
        // Active cutoff — 45s: user is on the chat page (heartbeat every 30s)
        $chatCutoff = now()->subSeconds(45);

        // All users with a recent session
        $activeSessions = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $sessionCutoff)
            ->pluck('user_id')
            ->unique()
            ->map(fn($id) => (int) $id)
            ->values()
            ->toArray();

        // Users actively on the chat page (sent heartbeat recently)
        $chatActive = [];
        try {
            $chatActive = DB::table('chat_heartbeats')
                ->where('last_seen', '>=', $chatCutoff)
                ->pluck('user_id')
                ->unique()
                ->map(fn($id) => (int) $id)
                ->values()
                ->toArray();
        } catch (\Exception $e) {
            // chat_heartbeats table may not exist yet in some environments
            \Log::warning('chat_heartbeats query failed: ' . $e->getMessage());
        }

        return response()->json([
            'active'   => $chatActive,
            'inactive' => array_values(array_diff($activeSessions, $chatActive)),
        ]);
    }

    public function heartbeat()
    {
        $user = Auth::user();
        try {
            DB::table('chat_heartbeats')->upsert(
                [['user_id' => $user->id, 'last_seen' => now()]],
                ['user_id'],
                ['last_seen']
            );
        } catch (\Exception $e) {
            \Log::warning('Heartbeat upsert failed: ' . $e->getMessage());
        }
        return response()->json(['ok' => true]);
    }

    // ─── Delete message ───────────────────────────────────────────────────────

    public function deleteMessage(Message $message)
    {
        $user = Auth::user();

        // Fix: table uses user_id not author_id
        abort_unless($message->user_id === $user->id, 403);

        if ($message->created_at->diffInSeconds(now()) > 60) {
            return response()->json(['error' => 'Messages can only be deleted within 1 minute of sending.'], 403);
        }

        \Binkode\ChatSystem\Models\ChatEvent::create([
            'made_id'    => $message->id,
            'made_type'  => get_class($message),
            'type'       => 'delete',
            'all'        => 0,
            'maker_id'   => $user->id,
            'maker_type' => get_class($user),
        ]);

        return response()->json(['success' => true]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        $department = $user->employee->department ?? null;
        if (is_array($department) || is_object($department)) {
            $department = is_array($department)
                ? ($department['name'] ?? json_encode($department))
                : ($department->name ?? json_encode($department));
        }

        $position = $user->employee->position ?? null;
        if (is_array($position) || is_object($position)) {
            $position = is_array($position)
                ? ($position['name'] ?? json_encode($position))
                : ($position->name ?? json_encode($position));
        }

        return [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'profile_picture' => $user->employee->profile_pic ?? null,
            'employee'        => $user->employee ? [
                'id'         => $user->employee->id,
                'department' => $department,
                'position'   => $position,
            ] : null,
        ];
    }
}
