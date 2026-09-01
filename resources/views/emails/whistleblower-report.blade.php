<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #1e293b; padding: 28px 32px; }
        .header h1 { color: #fff; margin: 0; font-size: 18px; }
        .header p { color: #94a3b8; margin: 6px 0 0; font-size: 13px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .badge-critical { background: #fee2e2; color: #dc2626; }
        .badge-high     { background: #ffedd5; color: #ea580c; }
        .badge-medium   { background: #fef9c3; color: #ca8a04; }
        .badge-low      { background: #dcfce7; color: #16a34a; }
        .body { padding: 28px 32px; }
        .row { margin-bottom: 16px; }
        .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
        .value { font-size: 14px; color: #1e293b; }
        .description-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 14px; color: #334155; line-height: 1.6; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; }
        .alert-box p { margin: 0; color: #991b1b; font-size: 13px; }
        .footer { background: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; font-size: 12px; color: #94a3b8; }
        .btn { display: inline-block; background: #0f766e; color: #fff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-size: 14px; font-weight: 600; margin-top: 20px; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🔒 Confidential Whistleblower Report</h1>
        <p>This message is strictly confidential and intended for authorised administrators only.</p>
    </div>
    <div class="body">

        @if($report->severity === 'critical')
        <div class="alert-box">
            <p>⚠️ <strong>CRITICAL severity report received.</strong> Immediate review is required.</p>
        </div>
        @endif

        <div class="row">
            <div class="label">Report ID</div>
            <div class="value">#{{ str_pad($report->id, 6, '0', STR_PAD_LEFT) }}</div>
        </div>

        <div class="row">
            <div class="label">Submitted</div>
            <div class="value">{{ $report->created_at->format('d M Y, h:i A') }}</div>
        </div>

        <div class="row">
            <div class="label">Reporter</div>
            <div class="value">{{ $report->reporter_display }}</div>
        </div>

        <div class="row">
            <div class="label">Category</div>
            <div class="value">{{ \App\Models\WhistleblowerReport::categories()[$report->category] ?? $report->category }}</div>
        </div>

        <div class="row">
            <div class="label">Severity</div>
            <div class="value">
                <span class="badge badge-{{ $report->severity }}">{{ ucfirst($report->severity) }}</span>
            </div>
        </div>

        <div class="row">
            <div class="label">Subject</div>
            <div class="value"><strong>{{ $report->subject }}</strong></div>
        </div>

        @if($report->accused_name)
        <div class="row">
            <div class="label">Person(s) Involved</div>
            <div class="value">{{ $report->accused_name }}@if($report->accused_department) — {{ $report->accused_department }}@endif</div>
        </div>
        @endif

        <hr>

        <div class="row">
            <div class="label">Description</div>
            <div class="description-box">{{ $report->description }}</div>
        </div>

        @if($report->attachments && count($report->attachments))
        <div class="row">
            <div class="label">Attachments</div>
            <div class="value">{{ count($report->attachments) }} file(s) attached</div>
        </div>
        @endif

        <a href="{{ url('/admin/whistleblower/' . $report->id) }}" class="btn">View Full Report →</a>

    </div>
    <div class="footer">
        <p>This report was submitted through the secure Whistleblower system. Do not forward this email. Handle with strict confidentiality.</p>
    </div>
</div>
</body>
</html>
