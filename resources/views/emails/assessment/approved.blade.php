@extends('emails.layout')

@section('title', 'Assessment Approved')
@section('header', 'Assessment Approved')
@section('subtitle', 'Your assessment has been approved')

@section('content')
<p>Dear {{ $user->name }},</p>

<p>Congratulations! Your <strong>{{ ucfirst($assessment->assessment_type) }} Assessment</strong> has been <strong>approved</strong>.</p>

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
        <span class="info-label">Final Rating:</span>
        <span class="info-value">
            <span class="rating-stars">
                @for($i = 1; $i <= 5; $i++)
                    {{ $i <= $assessment->rating ? '★' : '☆' }}
                @endfor
            </span>
            {{ $assessment->rating }}/5
            @php
                $ratingLabels = [
                    1 => 'Needs Improvement',
                    2 => 'Below Expectations', 
                    3 => 'Meets Expectations',
                    4 => 'Exceeds Expectations',
                    5 => 'Outstanding'
                ];
            @endphp
            ({{ $ratingLabels[$assessment->rating] ?? '' }})
        </span>
    </div>
    @endif
    <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value">
            <span class="status-badge status-approved">Approved</span>
        </span>
    </div>
    <div class="info-row">
        <span class="info-label">Approved Date:</span>
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
    <a href="{{ url('/competency-assessments/' . $assessment->id) }}" class="btn">View Assessment</a>
    <a href="{{ url('/my-assessments') }}" class="btn btn-success">My Assessments</a>
</div>

<p>This assessment is now part of your official performance record. Keep up the great work!</p>

<p>Best regards,<br>
Xonixs HR Team</p>
@endsection