<?php

namespace App\Mail;

use App\Models\CompetencyAssessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AssessmentRejected extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public CompetencyAssessment $assessment,
        public string $rejectionReason = ''
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Assessment Rejected - ' . $this->assessment->competency->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.assessment.rejected',
            with: [
                'assessment' => $this->assessment,
                'employee' => $this->assessment->employee,
                'user' => $this->assessment->employee->user,
                'competency' => $this->assessment->competency,
                'assessor' => $this->assessment->assessor,
                'rejectionReason' => $this->rejectionReason,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}