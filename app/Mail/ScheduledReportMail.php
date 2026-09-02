<?php

namespace App\Mail;

use App\Models\ScheduledReport;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ScheduledReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ScheduledReport $schedule,
        public string $filePath,
        public string $fileName,
    ) {}

    public function envelope(): Envelope
    {
        $label = $this->schedule->label
            ?? ($this->schedule->report_type_label . ' — ' . ucfirst($this->schedule->frequency));

        return new Envelope(
            subject: "[Report] {$label} — " . now()->format('d M Y'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.scheduled-report',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->filePath)
                ->as($this->fileName)
                ->withMime(
                    str_ends_with($this->fileName, '.pdf')
                        ? 'application/pdf'
                        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ),
        ];
    }
}
