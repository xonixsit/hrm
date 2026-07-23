<?php

namespace App\Events;

use Binkode\ChatSystem\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TeamMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastWith(): array
    {
        $sender = \App\Models\User::with('employee')->find($this->message->user_id);

        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'message' => $this->message->message,
            'sender_id' => $this->message->user_id,
            'sender' => $sender ? [
                'id' => $sender->id,
                'name' => $sender->name,
                'profile_picture' => $sender->profile_picture,
            ] : null,
            'created_at' => $this->message->created_at,
        ];
    }
}
