<?php

namespace App\Mail;

use App\Models\Leave;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeaveRequestRejected extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Leave $leaveRequest,
        public string $rejectionReason = ''
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Leave Request Rejected - ' . $this->leaveRequest->leave_type,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.leave.rejected',
            with: [
                'leaveRequest' => $this->leaveRequest,
                'employee' => $this->leaveRequest->employee,
                'user' => $this->leaveRequest->employee->user,
                'rejectionReason' => $this->rejectionReason,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}