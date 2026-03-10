<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $broadcast->title }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 40px 30px; text-align: center; color: white; position: relative; }
        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6); }
        .header h1 { margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.5px; }
        .header .icon { font-size: 36px; margin-bottom: 15px; display: block; }
        .content { padding: 40px 30px; }
        .content p { margin: 0 0 18px 0; font-size: 16px; line-height: 1.7; color: #374151; }
        .content h2 { color: #1f2937; font-size: 20px; margin: 30px 0 15px 0; }
        .info-card { background: #f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .info-card h3 { margin: 0 0 10px 0; color: #1f2937; font-size: 16px; }
        .info-card p { margin: 0; color: #6b7280; font-size: 14px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
        .stat-item { text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
        .stat-number { font-size: 24px; font-weight: 700; color: #1f2937; margin: 0; }
        .stat-label { font-size: 12px; color: #6b7280; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; transition: background 0.3s; }
        .button:hover { background: #2563eb; }
        .footer { background: #1f2937; color: #9ca3af; padding: 25px 30px; font-size: 13px; }
        .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .footer h4 { color: white; margin: 0 0 10px 0; font-size: 14px; }
        .footer p { margin: 0; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="icon">{{ $typeIcon }}</span>
            <h1>{{ $broadcast->title }}</h1>
        </div>
        
        <div class="content">
            {!! nl2br(e($broadcast->content)) !!}
            
            @if($broadcast->attachments && count($broadcast->attachments) > 0)
            <div class="info-card" style="background: #f0f9ff; border-left-color: #0ea5e9;">
                <h3>📎 Attachments ({{ count($broadcast->attachments) }})</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    @foreach($broadcast->attachments as $attachment)
                    <li style="margin: 5px 0; color: #374151;">
                        <strong>{{ $attachment['original_name'] }}</strong>
                        <span style="color: #6b7280; font-size: 12px;">
                            ({{ number_format($attachment['size'] / 1024, 1) }} KB)
                        </span>
                    </li>
                    @endforeach
                </ul>
                <p style="font-size: 12px; color: #6b7280; margin: 10px 0 0 0;">
                    Files are attached to this email. If you don't see them, please check your email client's attachment section.
                </p>
            </div>
            @endif
            
            @if($broadcast->notes)
            <div class="info-card">
                <h3>📋 Additional Information</h3>
                <p>{{ $broadcast->notes }}</p>
            </div>
            @endif
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="{{ config('app.url') }}" class="button">Access Dashboard</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-grid">
                <div>
                    <h4>{{ config('app.name') }}</h4>
                    <p>Your trusted HR management platform</p>
                </div>
                <div>
                    <h4>Broadcast Details</h4>
                    <p>
                        Sent by: {{ $broadcast->createdBy->name }}<br>
                        Date: {{ $broadcast->sent_at?->format('M d, Y H:i') }}<br>
                        Type: {{ ucfirst($broadcast->type) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>