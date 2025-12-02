<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class DailyAttendanceSummary extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $data,
        public Carbon $date
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Daily Attendance Summary - ' . $this->date->format('M d, Y'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reports.daily-attendance',
            with: [
                'user' => $this->user,
                'data' => $this->data,
                'date' => $this->date->format('F j, Y'),
                'dateString' => $this->date->format('Y-m-d'),
            ]
        );
    }

    public function attachments(): array
    {
        return [
            $this->generateAttendancePdf()
        ];
    }

    /**
     * Generate PDF attachment for attendance
     */
    private function generateAttendancePdf()
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pdf.daily-attendance', [
            'data' => $this->data,
            'date' => $this->date->format('F j, Y'),
            'dateString' => $this->date->format('Y-m-d'),
        ]);

        return \Illuminate\Mail\Mailables\Attachment::fromData(
            fn () => $pdf->output(),
            'daily-attendance-' . $this->date->format('Y-m-d') . '.pdf'
        )->withMime('application/pdf');
    }
}