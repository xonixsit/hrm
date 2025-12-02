<?php

namespace App\Mail;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyWorkReportSummary extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $recipient;
    public array $workReportsData;
    public Carbon $date;

    /**
     * Create a new message instance.
     */
    public function __construct(User $recipient, array $workReportsData, Carbon $date)
    {
        $this->recipient = $recipient;
        $this->workReportsData = $workReportsData;
        $this->date = $date;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Daily Work Reports Summary - ' . $this->date->format('F j, Y'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.daily-work-report-summary',
            with: [
                'recipient' => $this->recipient,
                'workReportsData' => $this->workReportsData,
                'date' => $this->date,
                'reportsUrl' => route('work-reports.index'),
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
        return [
            $this->generateWorkReportsPdf()
        ];
    }

    /**
     * Generate PDF attachment for work reports
     */
    private function generateWorkReportsPdf()
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pdf.daily-work-reports', [
            'data' => $this->workReportsData,
            'date' => $this->date->format('F j, Y'),
            'dateString' => $this->date->format('Y-m-d'),
        ]);

        return \Illuminate\Mail\Mailables\Attachment::fromData(
            fn () => $pdf->output(),
            'daily-work-reports-' . $this->date->format('Y-m-d') . '.pdf'
        )->withMime('application/pdf');
    }
}