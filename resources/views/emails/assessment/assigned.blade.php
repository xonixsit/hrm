@extends('emails.layout')

@section('title', 'Assessment Assigned')
@section('header', 'New Assessment Assigned')
@section('subtitle', 'You have been assigned a new competency assessment')

@section('content')
<p>Dear {{ $user->name }},</p>

<p>You have been assigned a new <strong>{{ ucfirst($assessment->assessment_type) }} Assessment</strong> to complete.</p>

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
    @if($assessment->assessment_type !== 'self')
    <div class="info-row">
        <span class="info-label">Employee to Assess:</span>
        <span class="info-value">{{ $user->name }}</span>
    </div>
    @endif
    <div class="info-row">
        <span class="info-label">Assigned By:</span>
        <span class="info-value">{{ $assessor->name }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value">
            <span class="status-badge status-pending">{{ ucfirst($assessment->status) }}</span>
        </span>
    </div>
    <div class="info-row">
        <span class="info-label">Assigned Date:</span>
        <span class="info-value">{{ $assessment->created_at->format('F j, Y g:i A') }}</span>
    </div>
</div>

@if($competency->description)
<div class="info-card">
    <h4 style="margin-top: 0;">Competency Description:</h4>
    <p>{{ $competency->description }}</p>
</div>
@endif

@if($competency->measurement_indicators)
<div class="info-card">
    <h4 style="margin-top: 0;">Measurement Indicators:</h4>
    <p>{{ $competency->measurement_indicators }}</p>
</div>
@endif

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ url('/competency-assessments/' . $assessment->id . '/evaluate') }}" class="btn btn-success">Complete Assessment</a>
    <a href="{{ url('/my-assessments') }}" class="btn">View My Assessments</a>
</div>

<p>Please complete this assessment at your earliest convenience. If you have any questions, feel free to reach out to your manager or HR team.</p>

<p>Best regards,<br>
Xonixs HR System</p>
@endsection