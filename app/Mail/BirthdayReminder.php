<?php

namespace App\Mail;

use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class BirthdayReminder extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Collection $upcomingBirthdays;
    public int $daysAhead;

    /**
     * Create a new message instance.
     */
    public function __construct(Collection $upcomingBirthdays, int $daysAhead = 3)
    {
        $this->upcomingBirthdays = $upcomingBirthdays;
        $this->daysAhead = $daysAhead;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $count = $this->upcomingBirthdays->count();
        $subject = $count === 1 
            ? '🎂 Upcoming Birthday Reminder'
            : "🎂 {$count} Upcoming Birthday Reminders";

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.birthday.reminder',
            with: [
                'upcomingBirthdays' => $this->upcomingBirthdays,
                'daysAhead' => $this->daysAhead,
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
