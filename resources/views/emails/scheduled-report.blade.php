<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 560px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #006970, #00a9b4); padding: 28px 32px; }
        .header h1 { color: #fff; margin: 0; font-size: 18px; }
        .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 28px 32px; }
        .meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
        .meta-row:last-child { margin-bottom: 0; }
        .meta-label { color: #64748b; }
        .meta-value { color: #1e293b; font-weight: 600; }
        .body p { color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
        .footer { background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>📊 Scheduled Report</h1>
        <p>{{ $schedule->label ?? ($schedule->report_type_label . ' — ' . ucfirst($schedule->frequency)) }}</p>
    </div>
    <div class="body">
        <div class="meta">
            <div class="meta-row">
                <span class="meta-label">Report Type</span>
                <span class="meta-value">{{ $schedule->report_type_label }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Format</span>
                <span class="meta-value">{{ strtoupper($schedule->report_format) }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Frequency</span>
                <span class="meta-value">{{ $schedule->frequency_label }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Generated</span>
                <span class="meta-value">{{ now()->format('d M Y, h:i A') }}</span>
            </div>
        </div>
        <p>Please find your scheduled report attached to this email. This report was automatically generated and sent as part of your scheduled reporting configuration.</p>
        <p>If you no longer wish to receive this report, please contact your administrator.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from the HR Management System. Do not reply.</p>
    </div>
</div>
</body>
</html>
