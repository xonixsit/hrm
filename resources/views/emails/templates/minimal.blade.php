<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $broadcast->title }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #1a202c; }
        .container { max-width: 600px; margin: 40px auto; background: white; }
        .header { padding: 60px 40px 40px; text-align: center; border-bottom: 1px solid #e2e8f0; }
        .header .icon { font-size: 48px; margin-bottom: 20px; display: block; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: -0.5px; color: #2d3748; }
        .content { padding: 40px; line-height: 1.7; }
        .content p { margin: 0 0 24px 0; font-size: 16px; color: #4a5568; }
        .content p:last-child { margin-bottom: 0; }
        .quote-block { border-left: 3px solid #4299e1; padding-left: 20px; margin: 30px 0; font-style: italic; color: #2d3748; }
        .note-section { background: #f7fafc; border: 1px solid #e2e8f0; padding: 24px; margin: 30px 0; border-radius: 4px; }
        .note-section h3 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #718096; }
        .note-section p { margin: 0; color: #4a5568; }
        .button { display: inline-block; background: #2d3748; color: white; padding: 12px 24px; text-decoration: none; font-weight: 500; margin: 30px 0; transition: background 0.2s; }
        .button:hover { background: #1a202c; }
        .divider { height: 1px; background: #e2e8f0; margin: 40px 0; }
        .footer { padding: 30px 40px; background: #f7fafc; border-top: 1px solid #e2e8f0; }
        .footer-content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-size: 13px; color: #718096; }
        .footer h4 { margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #4a5568; }
        .footer p { margin: 0; line-height: 1.5; }
        @media (max-width: 600px) {
            .container { margin: 0; }
            .header, .content, .footer { padding: 30px 20px; }
            .footer-content { grid-template-columns: 1fr; gap: 20px; }
        }
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
            <div class="note-section" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                <h3>📎 Attachments ({{ count($broadcast->attachments) }})</h3>
                <ul style="margin: 10px 0; padding-left: 20px; list-style-type: disc;">
                    @foreach($broadcast->attachments as $attachment)
                    <li style="margin: 5px 0;">
                        <strong>{{ $attachment['original_name'] }}</strong>
                        <span style="color: #64748b; font-size: 12px;">
                            ({{ number_format($attachment['size'] / 1024, 1) }} KB)
                        </span>
                    </li>
                    @endforeach
                </ul>
                <p style="font-size: 12px; color: #64748b; margin: 10px 0 0 0;">
                    Files are attached to this email.
                </p>
            </div>
            @endif
            
            @if($broadcast->notes)
            <div class="note-section">
                <h3>Additional Notes</h3>
                <p>{{ $broadcast->notes }}</p>
            </div>
            @endif
            
            <div class="divider"></div>
            
            <div style="text-align: center;">
                <a href="{{ config('app.url') }}" class="button">Access Dashboard</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <div>
                    <h4>{{ config('app.name') }}</h4>
                    <p>Human Resource Management System</p>
                </div>
                <div>
                    <h4>Message Details</h4>
                    <p>
                        From: {{ $broadcast->createdBy->name }}<br>
                        Sent: {{ $broadcast->sent_at?->format('M d, Y \a\t H:i') }}<br>
                        Type: {{ ucfirst($broadcast->type) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>