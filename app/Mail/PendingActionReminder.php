<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PendingActionReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $pendingItems
    ) {}

    public function envelope(): Envelope
    {
        $count = count($this->pendingItems);
        return new Envelope(
            subject: "⏰ You have {$count} pending " . ($count === 1 ? 'item' : 'items') . " requiring attention",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reminders.pending-actions',
            with: [
                'user' => $this->user,
                'pendingItems' => $this->pendingItems,
                'count' => count($this->pendingItems),
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}