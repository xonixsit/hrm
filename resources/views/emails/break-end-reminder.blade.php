<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Break Time Reminder</title>
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
            border-bottom: 2px solid #f59e0b;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #f59e0b;
            margin-bottom: 10px;
        }
        .warning-box {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .warning-box h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .break-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .cta-button {
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background: #d97706;
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
            <div class="logo">⏰ Xonobics HR System</div>
            <p style="margin: 0; color: #6b7280;">Break Time Reminder</p>
        </div>

        <p>Hello <strong>{{ $employee->user->name }}</strong>,</p>

        <div class="warning-box">
            <h3>⚠️ Break Time Exceeded!</h3>
            <p>Please end your current break and return to work</p>
        </div>

        <p>We notice="margind that your current break has exceeded the allowed time limit. Please end your break and return to work as soon as possible.</p>

        <div class="break-info">
            <p><strong>Break Details:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Break Number:</strong> {{ $breakNumber }}</li>
                <li><strong>Current Duration:</strong> {{ $duration }}</li>
                <li><strong>Allowed Limit:</strong> {{ $limit }}</li>
                <li><strong>Overtime:</strong> {{ $overtime }}</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="{{ $dashboardUrl }}" class="cta-button">
                🏃‍♂️ End Break Now
            </a>
        </div>

        <p><strong>Break Time Policy Reminder:</strong></p>
        <ul style="color: #4b5563;">
            <li>1st Break: Maximum 15 minutes</li>
            <li>2nd Break: Maximum 30 minutes (lunch)</li>
            <li>3rd Break: Maximum 15 minutes</li>
            <li>Please be mindful of break times to maintain productivity</li>
        </ul>

        <div class="footer">
            <p>
                <strong>Xonobics HR System</strong><br>
                This is an automated reminder. Please contact HR if you have any questions.
            </p>
        </div>
    </div>
</body>
</html>