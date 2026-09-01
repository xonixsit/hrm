<?php

namespace App\Mail;

use App\Models\WhistleblowerReport;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WhistleblowerReportNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public WhistleblowerReport $report) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[CONFIDENTIAL] New Whistleblower Report — ' . ucfirst($this->report->severity) . ' Severity',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.whistleblower-report',
        );
    }
}
