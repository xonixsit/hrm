<?php

namespace App\Services;

use App\Models\User;
use Binkode\ChatSystem\Models\Conversation;
use Binkode\ChatSystem\Models\Message;
use Binkode\ChatSystem\Models\ChatEvent;
use Illuminate\Support\Facades\DB;

/**
 * MessagingService — Facade + Repository over the Binkode ChatSystem tables.
 *
 * Centralises all messaging queries so the controller stays thin,
 * and replaces the N+1 getUnreadCount loop with one aggregated query.
 */
class MessagingService
{
    /**
     * Get all conversation IDs for a user.
     */
    public function conversationIdsFor(int $userId): array
    {
        return DB::table('conversation_users')
            ->where('user_id', $userId)
            ->pluck('conversation_id')
            ->toArray();
    }

    /**
     * Get the other participant's user_id in a private conversation.
     */
    public function otherParticipantId(int $conversationId, int $currentUserId): ?int
    {
        return DB::table('conversation_users')
            ->where('conversation_id', $conversationId)
            ->where('user_id', '!=', $currentUserId)
            ->value('user_id');
    }

    /**
     * Bulk unread counts for all conversations of a user — single query.
     * Returns [ conversationId => count ]
     */
    public function bulkUnreadCounts(array $conversationIds, int $userId): array
    {
        if (empty($conversationIds)) {
            return [];
        }

        // Count messages not sent by the user that have no 'read' ChatEvent from this user
        $rows = DB::table('messages')
            ->select('conversation_id', DB::raw('COUNT(*) as unread'))
            ->whereIn('conversation_id', $conversationIds)
            ->where('user_id', '!=', $userId)
            ->whereNotExists(function ($q) use ($userId) {
                $q->select(DB::raw(1))
                  ->from('chat_events')
                  ->whereColumn('chat_events.made_id', 'messages.id')
                  ->where('chat_events.made_type', 'Binkode\ChatSystem\Models\Message')
                  ->where('chat_events.type', 'read')
                  ->where('chat_events.maker_id', $userId)
                  ->where('chat_events.maker_type', 'App\Models\User');
            })
            ->groupBy('conversation_id')
            ->get();

        $map = array_fill_keys($conversationIds, 0);
        foreach ($rows as $row) {
            $map[$row->conversation_id] = (int) $row->unread;
        }
        return $map;
    }

    /**
     * Mark all unread messages in a conversation as read by the user.
     * Returns the IDs of messages that were newly marked.
     */
    public function markConversationRead(int $conversationId, int $userId, string $userClass): array
    {
        $unread = Message::where('conversation_id', $conversationId)
            ->where('user_id', '!=', $userId)
            ->whereNotExists(function ($q) use ($userId, $userClass) {
                $q->select(DB::raw(1))
                  ->from('chat_events')
                  ->whereColumn('chat_events.made_id', 'messages.id')
                  ->where('chat_events.made_type', 'Binkode\ChatSystem\Models\Message')
                  ->where('chat_events.type', 'read')
                  ->where('chat_events.maker_id', $userId)
                  ->where('chat_events.maker_type', $userClass);
            })
            ->pluck('id')
            ->toArray();

        if (empty($unread)) {
            return [];
        }

        $now = now();
        $inserts = array_map(fn($id) => [
            'made_id'    => $id,
            'made_type'  => 'Binkode\ChatSystem\Models\Message',
            'type'       => 'read',
            'all'        => 0,
            'maker_id'   => $userId,
            'maker_type' => $userClass,
            'created_at' => $now,
            'updated_at' => $now,
        ], $unread);

        // Insert all read events in one query
        DB::table('chat_events')->insert($inserts);

        return $unread;
    }

    /**
     * Fetch all messages in a conversation with sender data, in one query.
     */
    public function messagesForConversation(int $conversationId): array
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->where('type', 'user')
            ->orderBy('created_at', 'asc')
            ->get();

        if ($messages->isEmpty()) {
            return [];
        }

        $userIds  = $messages->pluck('user_id')->unique()->toArray();
        $users    = User::whereIn('id', $userIds)->get()->keyBy('id');

        // Determine which messages have been read by anyone other than the sender
        $readMsgIds = DB::table('chat_events')
            ->whereIn('made_id', $messages->pluck('id'))
            ->where('made_type', 'Binkode\ChatSystem\Models\Message')
            ->where('type', 'read')
            ->pluck('made_id')
            ->flip()
            ->toArray();

        return $messages->map(function (Message $msg) use ($users, $readMsgIds) {
            $sender = $users->get($msg->user_id);
            return [
                'id'         => $msg->id,
                'message'    => $msg->message,
                'sender_id'  => $msg->user_id,
                'sender'     => $sender ? [
                    'id'              => $sender->id,
                    'name'            => $sender->name,
                    'profile_picture' => $sender->profile_picture,
                ] : null,
                'is_read'    => isset($readMsgIds[$msg->id]),
                'created_at' => $msg->created_at,
            ];
        })->toArray();
    }

    /**
     * Format a single message for broadcast payload.
     */
    public function formatMessage(Message $message): array
    {
        $sender = User::find($message->user_id);
        return [
            'id'              => $message->id,
            'conversation_id' => $message->conversation_id,
            'message'         => $message->message,
            'sender_id'       => $message->user_id,
            'sender'          => $sender ? [
                'id'              => $sender->id,
                'name'            => $sender->name,
                'profile_picture' => $sender->profile_picture,
            ] : null,
            'is_read'         => false,
            'created_at'      => $message->created_at,
        ];
    }

    /**
     * Check whether a user is a participant in a conversation.
     */
    public function isParticipant(int $conversationId, int $userId): bool
    {
        return DB::table('conversation_users')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->exists();
    }
}
