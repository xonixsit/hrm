<?php

namespace App\Events;

use App\Models\TeamMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TeamMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $queue = 'default';

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(TeamMessage $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->sender_id,
            'message' => $this->message->message,
            'is_read' => $this->message->is_read,
            'created_at' => $this->message->created_at,
            'sender' => [
                'id' => $this->message->sender->id,
                'name' => $this->message->sender->name,
                'profile_picture' => $this->message->sender->profile_picture,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'TeamMessageSent';
    }
}
