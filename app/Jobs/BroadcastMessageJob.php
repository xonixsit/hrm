<?php

namespace App\Jobs;

use App\Models\TeamMessage;
use App\Events\TeamMessageSent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class BroadcastMessageJob implements ShouldQueue
{
    use Queueable;

    public $messageId;

    /**
     * Create a new job instance.
     */
    public function __construct($messageId)
    {
        $this->messageId = $messageId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if message still exists (not deleted via undo)
        $message = TeamMessage::find($this->messageId);
        
        if (!$message) {
            Log::info('Message was deleted via undo, skipping broadcast', ['message_id' => $this->messageId]);
            return;
        }

        // Check if message is still pending delivery
        if (!$message->pending_delivery) {
            Log::info('Message already delivered, skipping broadcast', ['message_id' => $this->messageId]);
            return;
        }

        // Mark as delivered and broadcast
        $message->update(['pending_delivery' => false]);
        
        try {
            broadcast(new TeamMessageSent($message->load('sender')));
            Log::info('Message broadcasted successfully after delay', ['message_id' => $this->messageId]);
        } catch (\Exception $e) {
            Log::error('Broadcasting failed after delay: ' . $e->getMessage());
        }
    }
}
