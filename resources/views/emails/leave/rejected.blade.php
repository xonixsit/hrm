@extends('emails.layout')

@section('title', 'Leave Request Rejected')
@section('header', 'Leave Request Rejected')
@section('subtitle', 'Your leave request has been rejected')

@section('content')
<p>Dear {{ $user->name }},</p>

<p>We regret to inform you that your leave request has been <strong>rejected</strong>.</p>

<div class="info-card">
    <div class="info-row">
        <span class="info-label">Leave Type:</span>
        <span class="info-value">{{ ucfirst(str_replace('_', ' ', $leaveRequest->leave_type)) }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">Start Date:</span>
        <span class="info-value">{{ $leaveRequest->start_date->format('F j, Y') }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">End Date:</span>
        <span class="info-value">{{ $leaveRequest->end_date->format('F j, Y') }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">Duration:</span>
        <span class="info-value">{{ $leaveRequest->days_requested }} day(s)</span>
    </div>
    <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value">
            <span class="status-badge status-rejected">Rejected</span>
        </span>
    </div>
</div>

@if($rejectionReason)
<div class="rejection-reason">
    <h4 style="margin-top: 0;">Reason for Rejection:</h4>
    <p>{{ $rejectionReason }}</p>
</div>
@endif

@if($leaveRequest->admin_comments)
<div class="info-card">
    <h4 style="margin-top: 0;">Admin Comments:</h4>
    <p>{{ $leaveRequest->admin_comments }}</p>
</div>
@endif

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ route('leaves.show', $leaveRequest->id) }}" class="btn">View Leave Details</a>
    <a href="{{ route('leaves.create') }}" class="btn btn-success">Submit New Request</a>
</div>

<p>If you have any questions about this decision, please contact your manager or HR department.</p>

<p>You may submit a new leave request with different dates if needed.</p>

<p>Best regards,<br>
Xonixs HR Team</p>
@endsection