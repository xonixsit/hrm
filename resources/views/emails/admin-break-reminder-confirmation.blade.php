<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Break Reminders Sent - {{ config('app.name') }}</title>
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e1e5e9;
            border-top: none;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border: 1px solid #e1e5e9;
            border-top: none;
            border-radius: 0 0 8px 8px;
            font-size: 14px;
            color: #6c757d;
        }
        .highlight {
            background: #fef3c7;
            padding: 15px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .stats-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .stats-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #d97706;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📧 Break Reminders Sent</h1>
        <p>Admin Confirmation Report</p>
    </div>

    <div class="content">
        <h2>Hello {{ $adminName }},</h2>
        
        <p>This is to confirm that break reminder emails have been successfully sent to employees who are exceeding their break time limits.</p>
        
        <div class="stats-box">
            <div class="stats-number">{{ $sentCount }}</div>
            <p style="margin: 0; color: #d97706; font-weight: 500;">Break reminder emails sent successfully</p>
        </div>

        <div class="highlight">
            <strong>📊 Reminder Details:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Sent by:</strong> {{ $adminName }}</li>
                <li><strong>Date & Time:</strong> {{ $timestamp }}</li>
                <li><strong>Total Recipients:</strong> {{ $sentCount }} employees</li>
                <li><strong>Action:</strong> Manual break reminder dispatch</li>
            </ul>
        </div>

        <p><strong>What happens next:</strong></p>
        <ul style="padding-left: 20px;">
            <li>Employees will receive individual break reminder emails</li>
            <li>They can click the dashboard link to end their break</li>
            <li>Break monitoring will update in real-time</li>
            <li>You can monitor break status from the admin dashboard</li>
        </ul>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <strong style="color: #92400e;">💡 Pro Tip:</strong>
            <p style="margin: 10px 0 0 0; color: #92400e;">
                You can view real-time break monitoring in the "Break Time Monitoring" widget on your admin dashboard. The system will automatically refresh to show employees as they end their breaks.
            </p>
        </div>

        <p>If you notice any issues with the break reminder system or need to send additional reminders, please use the break monitoring widget on your dashboard.</p>

        <p>Thank you for helping maintain proper break time compliance!</p>
        
        <p>Best regards,<br>
        The {{ config('app.name') }} System</p>
    </div>

    <div class="footer">
        <p>This confirmation was sent to {{ $adminName }}.</p>
        <p>Reminder sent at {{ $timestamp }} | Total recipients: {{ $sentCount }}</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>