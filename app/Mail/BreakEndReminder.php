<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Employee;

class BreakEndReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $employee;
    public $violation;

    /**
     * Create a new message instance.
     */
    public function __construct(Employee $employee, $violation)
    {
        $this->employee = $employee;
        $this->violation = $violation;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Break Time Reminder - Please End Your Break',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.break-end-reminder',
            with: [
                'employee' => $this->employee,
                'breakNumber' => $this->violation['break_number'],
                'duration' => $this->violation['duration'],
                'limit' => $this->violation['limit'],
                'overtime' => $this->violation['overtime'],
                'dashboardUrl' => route('dashboard'),
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