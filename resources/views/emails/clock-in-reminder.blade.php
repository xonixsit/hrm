<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Clock-In Reminder - {{ config('app.name') }}</title>
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
            background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
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
            background: #0d9488;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 500;
        }
        .highlight {
            background: #f0fdfa;
            padding: 15px;
            border-left: 4px solid #14b8a6;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .time-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .icon {
            font-size: 24px;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🕐 Clock-In Reminder</h1>
        <p>Don't forget to start your workday!</p>
    </div>

    <div class="content">
        <h2>Good morning, {{ $employee->user->name }}!</h2>
        
        <p>This is a friendly reminder to clock in for today's work session.</p>
        
        <div class="time-info">
            <strong style="color: #92400e;">⏰ Time to Clock In!</strong>
            <p style="margin: 10px 0 0 0; color: #92400e;">
                Remember to clock in at the start of your workday to ensure accurate time tracking and attendance records.
            </p>
        </div>

        <div class="highlight">
            <strong>📋 Quick Reminders:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Clock in when you start your workday</li>
                <li>Use the break feature for lunch and short breaks</li>
                <li>Don't forget to clock out at the end of your day</li>
                <li>Check your attendance summary in the dashboard</li>
            </ul>
        </div>

        <p><strong>How to Clock In:</strong></p>
        <ol style="padding-left: 20px;">
            <li>Click the "Access Dashboard" button below</li>
            <li>Look for the attendance widget on your dashboard</li>
            <li>Click the "Clock In" button</li>
            <li>Your work session will begin tracking automatically</li>
        </ol>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $dashboardUrl }}" class="button">Access Dashboard & Clock In</a>
        </div>

        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <strong style="color: #0c4a6e;">💡 Pro Tips:</strong>
            <ul style="margin: 10px 0; padding-left: 20px; color: #0c4a6e;">
                <li><strong>Mobile Access:</strong> You can clock in from any device with internet access</li>
                <li><strong>Break Tracking:</strong> Use the break feature to pause your work timer during lunch or breaks</li>
                <li><strong>Time Summary:</strong> View your daily work hours and break time in real-time</li>
                <li><strong>Attendance History:</strong> Check your attendance records anytime in the dashboard</li>
            </ul>
        </div>

        <p>If you have any questions about the attendance system or need technical support, please contact our HR team.</p>

        <p>Have a productive day!</p>
        
        <p>Best regards,<br>
        The {{ config('app.name') }} Team</p>
    </div>

    <div class="footer">
        <p>This reminder was sent to {{ $employee->user->email }}.</p>
        <p>Employee ID: {{ $employee->employee_code ?? $employee->id }} | Department: {{ $employee->department->name ?? 'Not Assigned' }}</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clock-In Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0d9488;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0d9488;
            margin-bottom: 10px;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .reminder-box {
            background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .reminder-box h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .reminder-box p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .cta-button {
            display: inline-block;
            background: #0d9488;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background: #0f766e;
        }
        .info-section {
            background: #f0fdfa;
            border-left: 4px solid #0d9488;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .time-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .time-info strong {
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🕐 Xonobics HR System</div>
            <p style="margin: 0; color: #6b7280;">Daily Clock-In Reminder</p>
        </div>

        <div class="greeting">
            Good Morning, <strong>{{ $employeeName }}</strong>! 👋
        </div>

        <div class="content">
            <p>Hope you're having a great start to your day! This is your friendly reminder to clock in for today's work.</p>

            <div class="reminder-box">
                <h3>⏰ Time to Clock In!</h3>
                <p>Don't forget to record your attendance for today</p>
            </div>

            <div class="info-section">
                <p><strong>Employee Details:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li><strong>Name:</strong> {{ $employeeName }}</li>
                    <li><strong>Position:</strong> {{ $jobTitle }}</li>
                    <li><strong>Department:</strong> {{ $department }}</li>
                </ul>
            </div>

            <div class="time-info">
                <p><strong>⏰ Current Time:</strong> {{ now()->format('l, F j, Y - g:i A') }}</p>
                <p><strong>📅 Date:</strong> {{ now()->format('F j, Y') }}</p>
            </div>

            <div style="text-align: center;">
                <a href="{{ $dashboardUrl }}" class="cta-button">
                    🕐 Clock In Now
                </a>
            </div>

            <p style="margin-top: 20px;">
                <strong>Quick Reminders:</strong>
            </p>
            <ul style="color: #4b5563;">
                <li>Clock in as soon as you start your workday</li>
                <li>Remember to take breaks and clock them properly</li>
                <li>Clock out when you finish your work</li>
                <li>Contact HR if you have any attendance-related questions</li>
            </ul>
        </div>

        <div class="footer">
            <p>
                <strong>Xonobics HR System</strong><br>
                This is an automated reminder. Please do not reply to this email.
            </p>
            <p style="margin-top: 10px;">
                If you have any questions, please contact your HR department.
            </p>
        </div>
    </div>
</body>
</html>