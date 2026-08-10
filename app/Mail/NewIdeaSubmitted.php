<?php

namespace App\Mail;

use App\Models\Idea;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewIdeaSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Idea $idea,
        public readonly User $submitter,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '💡 New Idea Submitted: ' . $this->idea->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ideas.new-idea',
        );
    }
}
