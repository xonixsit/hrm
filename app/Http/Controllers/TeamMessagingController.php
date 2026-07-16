<?php

namespace App\Http\Controllers;

use App\Models\User;
use Binkode\ChatSystem\Models\Conversation;
use Binkode\ChatSystem\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeamMessagingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get conversations using Laravel Chat System
        $conversationIds = \DB::table('conversation_users')
            ->where('user_id', $user->id)
            ->pluck('conversation_id');
        
        $conversations = Conversation::whereIn('id', $conversationIds)
            ->get()
            ->map(function ($conversation) use ($user) {
                // Get the other user from conversation_users table
                $otherUserId = \DB::table('conversation_users')
                    ->where('conversation_id', $conversation->id)
                    ->where('user_id', '!=', $user->id)
                    ->value('user_id');
                
                $otherUser = $otherUserId ? User::find($otherUserId) : null;
                
                // Get last message
                $lastMessage = Message::where('conversation_id', $conversation->id)
                    ->latest()
                    ->first();
                
                return [
                    'id' => $conversation->id,
                    'other_user' => $otherUser ? [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'email' => $otherUser->email,
                        'profile_picture' => $otherUser->profile_picture,
                    ] : null,
                    'last_message' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'message' => $lastMessage->message,
                        'sender_id' => $lastMessage->user_id,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'last_message_at' => $conversation->updated_at,
                    'unread_count' => $this->getUnreadCount($conversation, $user->id),
                ];
            });
        
        // Get all users for starting new conversations
        $users = User::where('id', '!=', $user->id)
            ->with('employee')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_picture' => $user->profile_picture,
                    'employee' => $user->employee ? [
                        'id' => $user->employee->id,
                        'department' => $user->employee->department,
                        'position' => $user->employee->position,
                    ] : null,
                ];
            });

        return Inertia::render('TeamMessaging/Index', [
            'conversations' => $conversations,
            'users' => $users,
        ]);
    }

    public function show(Conversation $conversation)
    {
        $user = Auth::user();
        
        // Check if user is part of this conversation
        $isParticipant = \DB::table('conversation_users')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->exists();
        
        if (!$isParticipant) {
            abort(403);
        }

        // Get the other user from conversation_users table
        $otherUserId = \DB::table('conversation_users')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $user->id)
            ->value('user_id');
        
        $otherUser = $otherUserId ? User::find($otherUserId) : null;

        // Mark messages as read using Chat System events
        $unreadMessages = Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('chatEvents', function($query) use ($user) {
                $query->where('type', 'read')
                      ->where('maker_id', $user->id);
            })
            ->get();

        foreach ($unreadMessages as $message) {
            \Binkode\ChatSystem\Models\ChatEvent::create([
                'message_id' => $message->id,
                'type' => 'read',
                'maker_id' => $user->id,
                'maker_type' => get_class($user)
            ]);
        }

        // Get all messages
        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Load users manually since Message model doesn't have user relationship
        $userIds = $messages->pluck('user_id')->unique();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        return Inertia::render('TeamMessaging/Show', [
            'conversation' => [
                'id' => $conversation->id,
                'other_user' => $otherUser ? [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'email' => $otherUser->email,
                    'profile_picture' => $otherUser->profile_picture,
                ] : null,
            ],
            'messages' => $messages->map(function ($message) use ($users) {
                $user = $users->get($message->user_id);
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_id' => $message->user_id,
                    'sender' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'profile_picture' => $user->profile_picture,
                    ] : null,
                    'is_read' => $message->chatEvents()->where('type', 'read')->exists(),
                    'created_at' => $message->created_at,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $otherUserId = $request->user_id;

        if ($user->id === $otherUserId) {
            return back()->with('error', 'You cannot start a conversation with yourself.');
        }

        // Check if conversation already exists
        $existingConversation = Conversation::whereHas('participants', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereHas('participants', function($query) use ($otherUserId) {
                $query->where('user_id', $otherUserId);
            })
            ->where('type', 'private')
            ->first();

        if ($existingConversation) {
            return redirect()->route('team-messaging.show', $existingConversation->id);
        }

        // Create new private conversation using Chat System models
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'name' => $user->name . ' & ' . User::find($otherUserId)->name,
            'type' => 'private'
        ]);

        // Add participants using DB table
        \DB::table('conversation_users')->insert([
            ['user_id' => $user->id, 'conversation_id' => $conversation->id],
            ['user_id' => $otherUserId, 'conversation_id' => $conversation->id]
        ]);

        return redirect()->route('team-messaging.show', $conversation->id);
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $user = Auth::user();
        
        // Check if user is part of this conversation
        $isParticipant = \DB::table('conversation_users')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->exists();
        
        if (!$isParticipant) {
            abort(403);
        }

        // Send message using Chat System models
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'message' => $request->message,
            'type' => 'user'
        ]);

        // Return updated messages for immediate display
        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Load users manually since Message model doesn't have user relationship
        $userIds = $messages->pluck('user_id')->unique();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');
        
        return back()->with([
            'messages' => $messages->map(function ($message) use ($users) {
                $user = $users->get($message->user_id);
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_id' => $message->user_id,
                    'sender' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'profile_picture' => $user->profile_picture,
                    ] : null,
                    'is_read' => $message->chatEvents()->where('type', 'read')->exists(),
                    'created_at' => $message->created_at,
                ];
            })
        ]);
    }

    public function getMessages(Conversation $conversation)
    {
        $user = Auth::user();
        
        // Check if user is part of this conversation
        $isParticipant = \DB::table('conversation_users')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->exists();
        
        if (!$isParticipant) {
            abort(403);
        }

        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Load users manually since Message model doesn't have user relationship
        $userIds = $messages->pluck('user_id')->unique();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        return response()->json([
            'messages' => $messages->map(function ($message) use ($users) {
                $user = $users->get($message->user_id);
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_id' => $message->user_id,
                    'sender' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'profile_picture' => $user->profile_picture,
                    ] : null,
                    'is_read' => $message->chatEvents()->where('type', 'read')->exists(),
                    'created_at' => $message->created_at,
                ];
            }),
        ]);
    }

    public function deleteMessage(Message $message)
    {
        $user = Auth::user();
        
        // Only allow users to delete their own messages
        if ($message->author_id !== $user->id) {
            abort(403);
        }

        // Only allow deletion within 1 minute of sending
        if ($message->created_at->diffInSeconds(now()) > 60) {
            return response()->json(['error' => 'Message can only be deleted within 1 minute of sending'], 403);
        }

        // Create delete event using Chat System models
        \Binkode\ChatSystem\Models\ChatEvent::create([
            'message_id' => $message->id,
            'type' => 'delete',
            'maker_id' => $user->id,
            'maker_type' => get_class($user)
        ]);

        return response()->json(['success' => true]);
    }

    private function getUnreadCount($conversation, $userId)
    {
        return Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $userId)
            ->whereDoesntHave('chatEvents', function($query) use ($userId) {
                $query->where('type', 'read')
                      ->where('maker_id', $userId);
            })
            ->count();
    }
}
