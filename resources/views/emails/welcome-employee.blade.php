<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to {{ config('app.name') }}</title>
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
        .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .highlight {
            background: #e3f2fd;
            padding: 15px;
            border-left: 4px solid #2196f3;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to {{ config('app.name') }}!</h1>
        <p>We're excited to have you join our team</p>
    </div>

    <div class="content">
        <h2>Hello {{ $user->name }},</h2>
        
        <p>Welcome to {{ config('app.name') }}! We're thrilled to have you as part of our growing team.</p>
        
        <div class="highlight">
            <strong>Your Account Details:</strong><br>
            Email: {{ $user->email }}<br>
            Account Created: {{ $user->created_at->format('F j, Y') }}
        </div>

        <p>Here's what you can expect next:</p>
        
        <ul>
            <li><strong>System Access:</strong> You now have access to our employee portal where you can manage your profile, view schedules, and more.</li>
            <li><strong>Onboarding:</strong> Your manager will reach out soon with onboarding information and next steps.</li>
            <li><strong>Resources:</strong> Explore the employee handbook and company resources in your dashboard.</li>
        </ul>

        <p>If you have any questions or need assistance, please don't hesitate to reach out to our HR team.</p>

        <a href="{{ route('dashboard') }}" class="button">Access Your Dashboard</a>

        <p>We look forward to working with you!</p>
        
        <p>Best regards,<br>
        The {{ config('app.name') }} Team</p>
    </div>

    <div class="footer">
        <p>This email was sent to {{ $user->email }}. If you have any questions, please contact our support team.</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>