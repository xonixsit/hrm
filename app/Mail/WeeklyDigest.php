<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class WeeklyDigest extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $data
    ) {}

    public function envelope(): Envelope
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        
        return new Envelope(
            subject: 'Weekly Digest - ' . $startOfWeek->format('M d') . ' to ' . $endOfWeek->format('M d, Y'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.digest.weekly',
            with: [
                'user' => $this->user,
                'data' => $this->data,
                'weekStart' => Carbon::now()->startOfWeek()->format('F j, Y'),
                'weekEnd' => Carbon::now()->endOfWeek()->format('F j, Y'),
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}