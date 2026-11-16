<?php

namespace App\Mail;

use App\Models\Referral;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReferralSubmitted extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Referral $referral) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Employee Referral — {$this->referral->candidate_name} for {$this->referral->position}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.referral.submitted',
            with: [
                'referral'  => $this->referral,
                'referrer'  => $this->referral->referrer,
            ]
        );
    }

    public function attachments(): array
    {
        if (!$this->referral->resume_path) {
            return [];
        }

        $fullPath = storage_path('app/public/' . $this->referral->resume_path);

        // Fallback: check public path directly
        if (!file_exists($fullPath)) {
            $fullPath = public_path($this->referral->resume_path);
        }

        if (!file_exists($fullPath)) {
            return [];
        }

        $filename = $this->referral->candidate_name . '_CV.' . pathinfo($fullPath, PATHINFO_EXTENSION);

        return [
            Attachment::fromPath($fullPath)->as($filename),
        ];
    }
}
