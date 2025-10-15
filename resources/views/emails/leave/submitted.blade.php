@extends('emails.layout')

@section('title', 'Leave Request Submitted')
@section('header', 'Leave Request Submitted')
@section('subtitle', 'A new leave request requires your attention')

@section('content')
<p>Hello,</p>

<p>A new leave request has been submitted and is awaiting approval.</p>

<div class="info-card">
    <div class="info-row">
        <span class="info-label">Employee:</span>
        <span class="info-value">{{ $user->name }}</span>
    </div>
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
            <span class="status-badge status-pending">{{ ucfirst($leaveRequest->status) }}</span>
        </span>
    </div>
</div>

@if($leaveRequest->reason)
<div class="info-card">
    <h4 style="margin-top: 0;">Reason for Leave:</h4>
    <p>{{ $leaveRequest->reason }}</p>
</div>
@endif

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ route('leaves.show', $leaveRequest->id) }}" class="btn">View Leave Request</a>
    <a href="{{ route('leaves.index') }}" class="btn btn-success">Manage Leave Requests</a>
</div>

<p>Please review and take appropriate action on this leave request.</p>

<p>Best regards,<br>
Xonixs HR System</p>
@endsection