@extends('emails.layout')

@section('title', 'Assessment Submitted')
@section('header', 'Assessment Submitted')
@section('subtitle', 'An assessment has been submitted for review')

@section('content')
<p>Hello,</p>

<p>A <strong>{{ ucfirst($assessment->assessment_type) }} Assessment</strong> has been submitted and is awaiting review.</p>

<div class="info-card">
    <div class="info-row">
        <span class="info-label">Employee:</span>
        <span class="info-value">{{ $user->name }}</span>
    </div>
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
        <span class="info-label">Rating:</span>
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
        <span class="info-label">Submitted By:</span>
        <span class="info-value">{{ $assessor->name }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value">
            <span class="status-badge status-submitted">{{ ucfirst($assessment->status) }}</span>
        </span>
    </div>
    <div class="info-row">
        <span class="info-label">Submitted Date:</span>
        <span class="info-value">{{ $assessment->updated_at->format('F j, Y g:i A') }}</span>
    </div>
</div>

@if($assessment->comments)
<div class="info-card">
    <h4 style="margin-top: 0;">Assessment Comments:</h4>
    <p>{{ $assessment->comments }}</p>
</div>
@endif

@if($assessment->development_notes)
<div class="info-card">
    <h4 style="margin-top: 0;">Development Notes:</h4>
    <p>{{ $assessment->development_notes }}</p>
</div>
@endif

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ url('/competency-assessments/' . $assessment->id) }}" class="btn">Review Assessment</a>
    <a href="{{ url('/competency-assessments') }}" class="btn btn-success">Manage Assessments</a>
</div>

<p>Please review this assessment and take appropriate action.</p>

<p>Best regards,<br>
Xonixs HR System</p>
@endsection