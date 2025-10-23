<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Support Request</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value {
            font-size: 16px;
            margin-top: 5px;
        }
        .description {
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .priority-high { border-left-color: #dc3545; }
        .priority-urgent { border-left-color: #fd7e14; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎧 New Support Request</h1>
        <p>A new support request has been submitted</p>
    </div>

    <div class="content">
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Request ID</div>
                <div class="info-value">#{{ $supportRequest->id }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Submitted By</div>
                <div class="info-value">{{ $user->name }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">{{ $user->email }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Category</div>
                <div class="info-value">{{ $supportRequest->category_label }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Priority</div>
                <div class="info-value">{{ $supportRequest->priority_label }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Submitted</div>
                <div class="info-value">{{ $supportRequest->created_at->format('M j, Y g:i A') }}</div>
            </div>
        </div>

        <div class="info-item" style="margin: 20px 0;">
            <div class="info-label">Subject</div>
            <div class="info-value" style="font-size: 18px; font-weight: 600;">{{ $supportRequest->subject }}</div>
        </div>

        <div class="description priority-{{ $supportRequest->priority }}">
            <div class="info-label">Description</div>
            <div style="margin-top: 10px; white-space: pre-wrap;">{{ $supportRequest->description }}</div>
        </div>

        @if($supportRequest->attachments && count($supportRequest->attachments) > 0)
        <div class="info-item">
            <div class="info-label">Attachments</div>
            <div class="info-value">
                @foreach($supportRequest->attachments as $attachment)
                    <div>📎 {{ $attachment['name'] ?? 'Attachment' }}</div>
                @endforeach
            </div>
        </div>
        @endif
    </div>

    <div class="footer">
        <p>This is an automated message from the Xonobics HRMS Support System.</p>
        <p>Please respond to this request as soon as possible based on the priority level.</p>
    </div>
</body>
</html>