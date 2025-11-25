<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminBreakReminderConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $sentCount;
    public $adminName;

    /**
     * Create a new message instance.
     */
    public function __construct($sentCount, $adminName)
    {
        $this->sentCount = $sentCount;
        $this->adminName = $adminName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Break Reminders Sent - Admin Confirmation',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-break-reminder-confirmation',
            with: [
                'sentCount' => $this->sentCount,
                'adminName' => $this->adminName,
                'timestamp' => now()->format('F j, Y - g:i A'),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}