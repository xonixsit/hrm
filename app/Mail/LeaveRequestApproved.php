<?php

namespace App\Mail;

use App\Models\Leave;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeaveRequestApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Leave $leaveRequest
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Leave Request Approved - ' . $this->leaveRequest->leave_type,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.leave.approved',
            with: [
                'leaveRequest' => $this->leaveRequest,
                'employee' => $this->leaveRequest->employee,
                'user' => $this->leaveRequest->employee->user,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}