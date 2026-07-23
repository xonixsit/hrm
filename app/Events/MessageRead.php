<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a recipient reads messages in a conversation.
 * Broadcast on conversation.{id} so the original sender's blue ticks update
 * in real-time without polling.
 */
class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $conversationId,
        public int $readByUserId,
        public array $messageIds   // IDs of messages now marked read
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'read_by'         => $this->readByUserId,
            'message_ids'     => $this->messageIds,
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageRead';
    }
}
