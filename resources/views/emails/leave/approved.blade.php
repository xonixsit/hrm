@extends('emails.layout')

@section('title', 'Leave Request Approved')
@section('header', 'Leave Request Approved')
@section('subtitle', 'Your leave request has been approved')

@section('content')
<p>Dear {{ $user->name }},</p>

<p>Great news! Your leave request has been <strong>approved</strong>.</p>

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
            <span class="status-badge status-approved">Approved</span>
        </span>
    </div>
    @if($leaveRequest->approved_at)
    <div class="info-row">
        <span class="info-label">Approved On:</span>
        <span class="info-value">{{ $leaveRequest->approved_at->format('F j, Y g:i A') }}</span>
    </div>
    @endif
</div>

@if($leaveRequest->admin_comments)
<div class="info-card">
    <h4 style="margin-top: 0;">Admin Comments:</h4>
    <p>{{ $leaveRequest->admin_comments }}</p>
</div>
@endif

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ route('leaves.show', $leaveRequest->id) }}" class="btn">View Leave Details</a>
    <a href="{{ route('leaves.index') }}" class="btn btn-success">My Leave Requests</a>
</div>

<p>Please ensure you complete any handover tasks before your leave begins.</p>

<p>Enjoy your time off!</p>

<p>Best regards,<br>
Xonixs HR Team</p>
@endsection