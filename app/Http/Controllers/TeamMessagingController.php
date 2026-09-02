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
    
    // ─── Show conversation page ───────────────────────────────────────────────

    public function show(Conversation $conversation)
    {
        $user = Auth::user();
        
        // Verify user is participant
        abort_unless($this->messaging->isParticipant($conversation->id, $user->id), 403);
        
        // Get messages for this conversation
        $messages = $this->messaging->messagesForConversation($conversation->id);
        
        // Get other user ID for 1-on-1 conversations
        $otherUserId = null;
        $otherUser   = null;
        $isBlocked   = false;
        if ($conversation->type !== 'group') {
            $otherUserId = $this->messaging->otherParticipantId($conversation->id, $user->id);
            if ($otherUserId) {
                $otherUser = User::with('employee')->find($otherUserId);
                $isBlocked = \App\Models\BlockedUser::isBlocked($user->id, $otherUserId);
            }
        }

        return Inertia::render('TeamMessaging/Show', [
            'conversation' => [
                'id'            => $conversation->id,
                'name'          => $conversation->name,
                'type'          => $conversation->type,
                'is_group'      => $conversation->type === 'group',
                'other_user_id' => $otherUserId,
                'other_user'    => $otherUser,
                'is_blocked'    => $isBlocked,
            ],
            'messages' => $messages,
        ]);
    }
    
    // ─── Page load ────────────────────────────────────────────────────────────

    public function index()
    {
        $user            = Auth::user();
        $conversationIds = $this->messaging->conversationIdsFor($user->id);
        $unreadMap       = $this->messaging->bulkUnreadCounts($conversationIds, $user->id);

        $conversations = Conversation::whereIn('id', $conversationIds)
            ->get()
            // Pin the default group first, then the rest by latest message
            ->sortByDesc(fn ($c) => [$c->is_default ? 1 : 0])
            ->values()
            ->map(function (Conversation $conv) use ($user, $unreadMap) {
                $isGroup = $conv->type === 'group';

                if ($isGroup) {
                    $participantCount = DB::table('conversation_users')
                        ->where('conversation_id', $conv->id)->count();
                    $otherUser = null;
                } else {
                    $otherUserId = $this->messaging->otherParticipantId($conv->id, $user->id);
                    $otherUser   = $otherUserId ? User::with('employee')->find($otherUserId) : null;
                    $participantCount = 2;
                }

                $lastMessage = Message::where('conversation_id', $conv->id)
                    ->where('type', 'user')
                    ->latest()
                    ->first();

                return [
                    'id'                => $conv->id,
                    'name'              => $conv->name,
                    'type'              => $conv->type,
                    'is_group'          => $isGroup,
                    'is_default'        => (bool) $conv->is_default,
                    'is_creator'        => $conv->user_id === $user->id,
                    'participant_count' => $participantCount,
                    'other_user'        => !$isGroup && $otherUser ? [
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

        // Get blocked user IDs
        $blockedUserIds = \App\Models\BlockedUser::where('blocker_id', $user->id)
            ->pluck('blocked_id')
            ->toArray();

        $users = User::where('id', '!=', $user->id)
            ->with('employee')
            ->get()
            ->map(fn(User $u) => $this->formatUser($u));

        // Separate blocked users from regular users
        $blockedUsers = $users->filter(fn($u) => in_array($u['id'], $blockedUserIds))->values();
        $regularUsers = $users->filter(fn($u) => !in_array($u['id'], $blockedUserIds))->values();

        return Inertia::render('TeamMessaging/Index', [
            'conversations' => $conversations,
            'users'         => $regularUsers,
            'blockedUsers'  => $blockedUsers,
        ]);
    }

    // ─── Create group conversation ────────────────────────────────────────────

    public function createGroup(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $user    = Auth::user();
        $members = array_unique(array_merge([$user->id], $request->user_ids));

        $conv = Conversation::create([
            'user_id' => $user->id,
            'name'    => $request->name,
            'type'    => 'group',
        ]);

        $inserts = array_map(fn($uid) => [
            'user_id'         => $uid,
            'conversation_id' => $conv->id,
            'created_at'      => now(),
            'updated_at'      => now(),
        ], $members);
        DB::table('conversation_users')->insert($inserts);

        return response()->json(['conversation_id' => $conv->id, 'name' => $conv->name]);
    }

    // ─── Update group name ────────────────────────────────────────────────────

    public function updateGroup(Request $request, Conversation $conversation)
    {
        abort_unless($conversation->type === 'group', 400);
        abort_unless(Auth::user()->hasRole('Admin'), 403, 'Only admins can rename groups.');
        abort_if($conversation->is_default, 403, 'The Company group cannot be renamed.');

        $request->validate(['name' => 'required|string|max:100']);
        $conversation->update(['name' => $request->name]);

        return response()->json(['ok' => true]);
    }

    // ─── Add member to group ──────────────────────────────────────────────────

    public function addMember(Request $request, Conversation $conversation)
    {
        abort_unless($conversation->type === 'group', 400);
        abort_unless(Auth::user()->hasRole('Admin'), 403, 'Only admins can add members.');

        $request->validate(['user_id' => 'required|exists:users,id']);

        $exists = DB::table('conversation_users')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $request->user_id)
            ->exists();

        if (!$exists) {
            DB::table('conversation_users')->insert([
                'user_id'         => $request->user_id,
                'conversation_id' => $conversation->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }

        return response()->json(['ok' => true]);
    }

    // ─── Remove member from group ─────────────────────────────────────────────

    public function removeMember(Request $request, Conversation $conversation)
    {
        abort_unless($conversation->type === 'group', 400);
        $user = Auth::user();
        // Creator can remove anyone; members can remove themselves
        $targetId = (int) $request->user_id;
        abort_unless($conversation->user_id === $user->id || $targetId === $user->id, 403);

        DB::table('conversation_users')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $targetId)
            ->delete();

        return response()->json(['ok' => true]);
    }

    // ─── Delete group ─────────────────────────────────────────────────────────

    public function deleteGroup(Conversation $conversation)
    {
        abort_unless($conversation->type === 'group', 400);
        abort_unless(Auth::user()->hasRole('Admin'), 403, 'Only admins can delete groups.');
        abort_if($conversation->is_default, 403, 'The Company group cannot be deleted.');

        $conversation->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Get group members ────────────────────────────────────────────────────

    public function groupMembers(Conversation $conversation)
    {
        abort_unless($this->messaging->isParticipant($conversation->id, Auth::id()), 403);

        $members = DB::table('conversation_users')
            ->join('users', 'users.id', '=', 'conversation_users.user_id')
            ->leftJoin('employees', 'employees.user_id', '=', 'users.id')
            ->where('conversation_users.conversation_id', $conversation->id)
            ->whereNull('employees.deleted_at')
            ->select('users.id', 'users.name', 'users.email', 'employees.profile_pic')
            ->get()
            ->map(fn($m) => [
                'id'              => $m->id,
                'name'            => $m->name,
                'email'           => $m->email,
                'profile_picture' => $m->profile_pic ?? null,
            ]);

        return response()->json([
            'members'    => $members,
            'creator_id' => $conversation->user_id,
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

        // Check if users are blocked (for 1-on-1 conversations)
        if ($conversation->type !== 'group') {
            $recipientId = $this->messaging->otherParticipantId($conversation->id, $user->id);
            
            if ($recipientId && \App\Models\BlockedUser::isBlockedBetween($user->id, $recipientId)) {
                return response()->json([
                    'error' => 'Cannot send message. One of you has blocked the other.'
                ], 403);
            }
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id'         => $user->id,
            'message'         => $request->message,
            'type'            => 'user',
        ]);

        $payload     = $this->messaging->formatMessage($message);
        $recipientId = $this->messaging->otherParticipantId($conversation->id, $user->id);

        try {
            broadcast(new TeamMessageSent($message));

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

    // ─── Upload image ─────────────────────────────────────────────────────────

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        try {
            $user = Auth::user();
            $conversationId = $request->conversation_id;
            
            // Verify user is participant of the conversation
            abort_unless($this->messaging->isParticipant($conversationId, $user->id), 403, 'Not authorized to upload to this conversation');

            // Check block status for 1-on-1 conversations
            $conversation = \Binkode\ChatSystem\Models\Conversation::find($conversationId);
            if ($conversation && $conversation->type !== 'group') {
                $recipientId = $this->messaging->otherParticipantId($conversationId, $user->id);
                if ($recipientId && \App\Models\BlockedUser::isBlockedBetween($user->id, $recipientId)) {
                    return response()->json(['success' => false, 'message' => 'Cannot upload. One of you has blocked the other.'], 403);
                }
            }

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                // Generate unique filename
                $filename = 'chat_' . $conversationId . '_' . $user->id . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                // Store in PRIVATE storage (same location as old system)
                $path = $file->storeAs('chat-images', $filename, 'local');
                
                // Return a secure URL that requires authentication
                $url = route('team-messaging.image', ['filename' => $filename]);
                
                return response()->json([
                    'success' => true,
                    'url' => $url,
                    'filename' => $filename,
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'No image file provided',
            ], 400);
            
        } catch (\Exception $e) {
            \Log::error('Image upload failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image',
            ], 500);
        }
    }
    
    // ─── Upload document (PDF, Excel, Word, etc.) ─────────────────────────────

    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv|max:20480', // 20MB max
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        try {
            $user = Auth::user();
            $conversationId = $request->conversation_id;
            
            // Verify user is participant of the conversation
            abort_unless($this->messaging->isParticipant($conversationId, $user->id), 403, 'Not authorized to upload to this conversation');

            // Check block status for 1-on-1 conversations
            $conversation = \Binkode\ChatSystem\Models\Conversation::find($conversationId);
            if ($conversation && $conversation->type !== 'group') {
                $recipientId = $this->messaging->otherParticipantId($conversationId, $user->id);
                if ($recipientId && \App\Models\BlockedUser::isBlockedBetween($user->id, $recipientId)) {
                    return response()->json(['success' => false, 'message' => 'Cannot upload. One of you has blocked the other.'], 403);
                }
            }

            if ($request->hasFile('document')) {
                $file = $request->file('document');
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                
                // Generate unique filename while preserving original name info
                $filename = 'doc_' . $conversationId . '_' . $user->id . '_' . time() . '_' . uniqid() . '.' . $extension;
                
                // Store in PRIVATE storage
                $path = $file->storeAs('chat-documents', $filename, 'local');
                
                // Return a secure URL that requires authentication
                $url = route('team-messaging.document', ['filename' => $filename]);
                
                return response()->json([
                    'success' => true,
                    'url' => $url,
                    'filename' => $filename,
                    'original_name' => $originalName,
                    'extension' => $extension,
                    'size' => $file->getSize(),
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'No document file provided',
            ], 400);
            
        } catch (\Exception $e) {
            \Log::error('Document upload failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document',
            ], 500);
        }
    }

    // ─── Serve private image with authorization ──────────────────────────────

    public function serveImage($filename)
    {
        $user = Auth::user();
        
        \Log::info('ServeImage called', [
            'filename' => $filename,
            'user_id' => $user->id,
            'user_roles' => $user->roles->pluck('name')->toArray()
        ]);
        
        // Extract conversation ID from filename (format: chat_{conv_id}_{user_id}_{timestamp}_{uniqid}.ext)
        $parts = explode('_', $filename);
        if (count($parts) < 4 || $parts[0] !== 'chat') {
            \Log::warning('Invalid filename format', ['filename' => $filename, 'parts' => $parts]);
            abort(404, 'Invalid image');
        }
        
        $conversationId = (int) $parts[1];
        
        \Log::info('Extracted conversation ID', ['conversation_id' => $conversationId]);
        
        // Allow admins to view all images, or verify user is participant
        $isAdmin = $user->hasRole('Admin');
        $isParticipant = $this->messaging->isParticipant($conversationId, $user->id);
        
        \Log::info('Authorization check', [
            'is_admin' => $isAdmin,
            'is_participant' => $isParticipant
        ]);
        
        if (!$isAdmin && !$isParticipant) {
            \Log::warning('Access denied', ['user_id' => $user->id, 'conversation_id' => $conversationId]);
            abort(403, 'You do not have access to this image');
        }
        
        // Check if file exists in private storage (same location as old system)
        $path = 'chat-images/' . $filename;
        
        \Log::info('Checking file path', ['path' => $path, 'exists' => \Storage::disk('local')->exists($path)]);
        
        if (!\Storage::disk('local')->exists($path)) {
            \Log::error('File not found', ['path' => $path]);
            abort(404, 'Image not found');
        }
        
        // Get file and return as response with proper headers
        $file = \Storage::disk('local')->get($path);
        $mimeType = \Storage::disk('local')->mimeType($path);
        
        \Log::info('Serving image', ['mime_type' => $mimeType, 'size' => strlen($file)]);
        
        return response($file, 200)->header('Content-Type', $mimeType);
    }
    
    // ─── Serve private document with authorization ───────────────────────────

    public function serveDocument($filename)
    {
        $user = Auth::user();
        
        // Extract conversation ID from filename (format: doc_{conv_id}_{user_id}_{timestamp}_{uniqid}.ext)
        $parts = explode('_', $filename);
        if (count($parts) < 4 || $parts[0] !== 'doc') {
            abort(404, 'Invalid document');
        }
        
        $conversationId = (int) $parts[1];
        
        // Allow admins to view all documents, or verify user is participant
        $isAdmin = $user->hasRole('Admin');
        $isParticipant = $this->messaging->isParticipant($conversationId, $user->id);
        
        if (!$isAdmin && !$isParticipant) {
            abort(403, 'You do not have access to this document');
        }
        
        // Check if file exists in private storage
        $path = 'chat-documents/' . $filename;
        
        if (!\Storage::disk('local')->exists($path)) {
            abort(404, 'Document not found');
        }
        
        // Get file and return as download
        $file = \Storage::disk('local')->get($path);
        $mimeType = \Storage::disk('local')->mimeType($path);
        
        // Return as inline or download based on mime type
        $disposition = in_array($mimeType, ['application/pdf']) ? 'inline' : 'attachment';
        
        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', $disposition . '; filename="' . $filename . '"');
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
        // Session cutoff — 15 minutes (tighter than before)
        $sessionCutoff = now()->subMinutes(15)->getTimestamp();
        // Chat-active cutoff — 45s (heartbeat every 30s)
        $chatCutoff = now()->subSeconds(45);

        // Users with a genuinely recent session (last 15 min)
        $activeSessions = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $sessionCutoff)
            ->pluck('user_id')
            ->unique()
            ->map(fn($id) => (int) $id)
            ->values()
            ->toArray();

        // Users on chat page right now (heartbeat within 45s)
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
            \Log::warning('chat_heartbeats query failed: ' . $e->getMessage());
        }

        // Users currently clocked in — show as active regardless of session age
        $clockedInUserIds = DB::table('attendances')
            ->join('employees', 'attendances.employee_id', '=', 'employees.id')
            ->whereDate('attendances.date', today())
            ->where('attendances.status', 'clocked_in')
            ->whereNull('employees.deleted_at')
            ->pluck('employees.user_id')
            ->unique()
            ->map(fn($id) => (int) $id)
            ->values()
            ->toArray();

        // Users who clocked OUT today — remove from active/inactive regardless of session
        $clockedOutUserIds = DB::table('attendances')
            ->join('employees', 'attendances.employee_id', '=', 'employees.id')
            ->whereDate('attendances.date', today())
            ->where('attendances.status', 'clocked_out')
            ->whereNull('employees.deleted_at')
            ->pluck('employees.user_id')
            ->unique()
            ->map(fn($id) => (int) $id)
            ->values()
            ->toArray();

        // Active (green) = on chat page OR clocked-in AND has active session
        // But never show clocked-out employees as active
        $active = array_values(array_unique(array_merge($chatActive, $clockedInUserIds)));
        $active = array_values(array_diff($active, $clockedOutUserIds));

        // Inactive (orange) = has recent session but not active, and not clocked out
        $inactive = array_values(array_diff($activeSessions, $active, $clockedOutUserIds));

        // Offline = everyone else (not in active or inactive)
        return response()->json([
            'active'   => $active,
            'inactive' => $inactive,
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

    // ─── Mark conversation as unread ─────────────────────────────────────────

    public function markUnread(Conversation $conversation)
    {
        $user = Auth::user();

        abort_unless($this->messaging->isParticipant($conversation->id, $user->id), 403);

        // Find the latest message NOT sent by the current user
        $latestIncoming = Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $user->id)
            ->where('type', 'user')
            ->whereNull('admin_deleted_at')
            ->latest()
            ->first();

        if (! $latestIncoming) {
            return response()->json(['ok' => true, 'message' => 'No incoming messages to mark unread']);
        }

        // Delete the read chat_event for this message by the current user
        // This makes the unread count go back to at least 1
        DB::table('chat_events')
            ->where('made_id',    $latestIncoming->id)
            ->where('made_type',  'Binkode\ChatSystem\Models\Message')
            ->where('type',       'read')
            ->where('maker_id',   $user->id)
            ->where('maker_type', get_class($user))
            ->delete();

        return response()->json(['ok' => true]);
    }

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

    // ─── Block / Unblock User ──────────────────────────────────────────────────

    public function blockUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $targetUserId = $request->user_id;

        // Can't block yourself
        if ($user->id === $targetUserId) {
            return response()->json(['error' => 'You cannot block yourself'], 400);
        }

        // Check if already blocked
        if (\App\Models\BlockedUser::isBlocked($user->id, $targetUserId)) {
            return response()->json(['error' => 'User is already blocked'], 400);
        }

        \App\Models\BlockedUser::create([
            'blocker_id' => $user->id,
            'blocked_id' => $targetUserId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User blocked successfully',
        ]);
    }

    public function unblockUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $targetUserId = $request->user_id;

        \App\Models\BlockedUser::where('blocker_id', $user->id)
            ->where('blocked_id', $targetUserId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'User unblocked successfully',
        ]);
    }

    public function isUserBlocked(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $targetUserId = $request->user_id;

        $isBlocked = \App\Models\BlockedUser::isBlocked($user->id, $targetUserId);

        return response()->json([
            'is_blocked' => $isBlocked,
        ]);
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
