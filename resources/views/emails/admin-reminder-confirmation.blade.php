<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Clock-In Reminders Sent - {{ config('app.name') }}</title>
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
        .highlight {
            background: #f0fdfa;
            padding: 15px;
            border-left: 4px solid #14b8a6;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .stats-box {
            background: #e6fffa;
            border: 1px solid #14b8a6;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .stats-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #0d9488;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📧 Clock-In Reminders Sent</h1>
        <p>Admin Confirmation Report</p>
    </div>

    <div class="content">
        <h2>Hello {{ $adminName }},</h2>
        
        <p>This is to confirm that clock-in reminder emails have been successfully sent to employees who haven't clocked in today.</p>
        
        <div class="stats-box">
            <div class="stats-number">{{ $sentCount }}</div>
            <p style="margin: 0; color: #0d9488; font-weight: 500;">Reminder emails sent successfully</p>
        </div>

        <div class="highlight">
            <strong>📊 Reminder Details:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Sent by:</strong> {{ $adminName }}</li>
                <li><strong>Date & Time:</strong> {{ $timestamp }}</li>
                <li><strong>Total Recipients:</strong> {{ $sentCount }} employees</li>
                <li><strong>Action:</strong> Manual clock-in reminder dispatch</li>
            </ul>
        </div>

        <p><strong>What happens next:</strong></p>
        <ul style="padding-left: 20px;">
            <li>Employees will receive individual reminder emails</li>
            <li>They can click the dashboard link to clock in</li>
            <li>Attendance tracking will update in real-time</li>
            <li>You can monitor clock-in status from the admin dashboard</li>
        </ul>

        <div style="background: #e0f2fe; border: 1px solid #0288d1; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>📎 Attachment Included:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>File:</strong> missed-clock-ins-{{ now()->format('Y-m-d') }}.xlsx</li>
                <li><strong>Contains:</strong> Complete list of employees who missed clock-in</li>
                <li><strong>Data:</strong> Names, employee codes, emails, departments, job titles, phone numbers, and managers</li>
                <li><strong>Use for:</strong> Follow-up actions, reporting, or HR records</li>
            </ul>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <strong style="color: #92400e;">💡 Pro Tip:</strong>
            <p style="margin: 10px 0 0 0; color: #92400e;">
                You can view real-time attendance updates in the "Today's Attendance Tracking" widget on your admin dashboard. The system will automatically refresh to show employees as they clock in.
            </p>
        </div>

        <p>If you notice any issues with the reminder system or need to send additional reminders, please use the attendance tracking widget on your dashboard.</p>

        <p>Thank you for helping maintain accurate attendance records!</p>
        
        <p>Best regards,<br>
        The {{ config('app.name') }} System</p>
    </div>

    <div class="footer">
        <p>This is an automated confirmation email sent to {{ $adminName }}.</p>
        <p>Reminder sent at {{ $timestamp }} | Total recipients: {{ $sentCount }}</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clock-In Reminders Sent - Confirmation</title>
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
        .success-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .success-box h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f0fdfa;
            border: 1px solid #0d9488;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #0d9488;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            color: #374151;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✅ Xonobics HR System</div>
            <p style="margin: 0; color: #6b7280;">Admin Confirmation - Clock-In Reminders</p>
        </div>

        <div class="success-box">
            <h3>🎯 Reminders Successfully Sent!</h3>
            <p>Clock-in reminder emails have been dispatched to employees</p>
        </div>

        <p>Hello <strong>{{ $adminName }}</strong>,</p>

        <p>This is to confirm that you have successfully sent clock-in reminder emails to employees who haven't clocked in today.</p>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">{{ $sentCount }}</div>
                <div class="stat-label">Reminders Sent</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ $timestamp }}</div>
                <div class="stat-label">Sent At</div>
            </div>
        </div>

        <div class="info-section">
            <p><strong>📋 Action Summary:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>✅ {{ $sentCount }} clock-in reminder emails sent</li>
                <li>📧 Emails delivered to employees who missed clock-in</li>
                <li>🔗 Each email contains direct link to dashboard</li>
                <li>📊 Action logged in system for audit trail</li>
            </ul>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ul style="color: #4b5563;">
            <li>Monitor attendance dashboard for employee responses</li>
            <li>Follow up with employees who still don't clock in</li>
            <li>Check system logs for any delivery issues</li>
        </ul>

        <div class="footer">
            <p>
                <strong>Xonobics HR System - Admin Panel</strong><br>
                This is an automated confirmation email.
            </p>
            <p style="margin-top: 10px;">
                Action performed by: {{ $adminName }} at {{ $timestamp }}
            </p>
        </div>
    </div>
</body>
</html>