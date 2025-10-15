@extends('emails.layout')

@section('title', 'Assessment Rejected')
@section('header', 'Assessment Rejected')
@section('subtitle', 'Your assessment requires revision')

@section('content')
<p>Dear {{ $user->name }},</p>

<p>Your <strong>{{ ucfirst($assessment->assessment_type) }} Assessment</strong> has been <strong>rejected</strong> and requires revision.</p>

<div class="info-card">
    <div class="info-row">
        <span class="info-label">Assessment Type:</span>
        <span class="info-value">{{ ucfirst($assessment->assessment_type) }} Assessment</span>
    </div>
    <div class="info-row">
        <span class="info-label">Competency:</span>
        <span class="info-value">{{ $competency->name }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">Category:</span>
        <span class="info-value">{{ $competency->category }}</span>
    </div>
    @if($assessment->rating)
    <div class="info-row">
        <span class="info-label">Current Rating:</span>
        <span class="info-value">
            <span class="rating-stars">
                @for($i = 1; $i <= 5; $i++)
                    {{ $i <= $assessment->rating ? '★' : '☆' }}
                @endfor
            </span>
            {{ $assessment->rating }}/5
        </span>
    </div>
    @endif
    <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value">
            <span class="status-badge status-rejected">Rejected</span>
        </span>
    </div>
    <div class="info-row">
        <span class="info-label">Rejected Date:</span>
        <span class="info-value">{{ $assessment->updated_at->format('F j, Y g:i A') }}</span>
    </div>
</div>

@if($rejectionReason)
<div class="rejection-reason">
    <h4 style="margin-top: 0;">Reason for Rejection:</h4>
    <p>{{ $rejectionReason }}</p>
</div>
@endif

@if($assessment->comments)
<div class="info-card">
    <h4 style="margin-top: 0;">Current Assessment Comments:</h4>
    <p>{{ $assessment->comments }}</p>
</div>
@endif

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ route('competency-assessments.evaluate', $assessment->id) }}" class="btn btn-success">Revise Assessment</a>
    <a href="{{ route('competency-assessments.show', $assessment->id) }}" class="btn">View Details</a>
</div>

<p>Please review the feedback provided and revise your assessment accordingly. If you have any questions, please contact your manager or HR team.</p>

<p>Best regards,<br>
Xonixs HR Team</p>
@endsection