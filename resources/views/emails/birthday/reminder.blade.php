<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upcoming Birthday Reminders</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .reminder-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        .title {
            color: #e17055;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #636e72;
            font-size: 16px;
        }
        .birthday-list {
            margin: 30px 0;
        }
        .birthday-item {
            background: #f8f9fa;
            border-left: 4px solid #e17055;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 0 8px 8px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .employee-info {
            flex: 1;
        }
        .employee-name {
            font-size: 18px;
            font-weight: 600;
            color: #2d3436;
            margin-bottom: 5px;
        }
        .employee-details {
            font-size: 14px;
            color: #636e72;
        }
        .birthday-date {
            background: linear-gradient(45deg, #e17055, #fab1a0);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            white-space: nowrap;
            margin-left: 15px;
        }
        .days-indicator {
            font-size: 12px;
            background: #fdcb6e;
            color: #2d3436;
            padding: 4px 8px;
            border-radius: 10px;
            margin-top: 5px;
            display: inline-block;
        }
        .celebration-tip {
            background: #e8f4fd;
            border: 1px solid #74b9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .tip-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .company-name {
            color: #e17055;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="reminder-icon">🎂</div>
            <h1 class="title">Upcoming Birthday{{ $upcomingBirthdays->count() > 1 ? 's' : '' }}</h1>
            <p class="subtitle">
                Don't forget to wish your colleagues a happy birthday in the next {{ $daysAhead }} days!
            </p>
        </div>
        
        <div class="birthday-list">
            @foreach($upcomingBirthdays as $birthdayEmployee)
                @php
                    $employee = $birthdayEmployee['employee'];
                    $daysUntil = $birthdayEmployee['days_until'];
                    $birthdayDate = $birthdayEmployee['birthday_date'];
                @endphp
                
                <div class="birthday-item">
                    <div class="employee-info">
                        <div class="employee-name">
                            🎉 {{ $employee->getFullName() }}
                        </div>
                        <div class="employee-details">
                            {{ $employee->job_title ?? 'Employee' }}
                            @if($employee->department)
                                • {{ $employee->department->name }}
                            @endif
                        </div>
                        <div class="days-indicator">
                            @if($daysUntil === 0)
                                🎈 Today!
                            @elseif($daysUntil === 1)
                                📅 Tomorrow
                            @else
                                📅 In {{ $daysUntil }} days
                            @endif
                        </div>
                    </div>
                    <div class="birthday-date">
                        {{ $birthdayDate->format('M j') }}
                    </div>
                </div>
            @endforeach
        </div>
        
        <div class="celebration-tip">
            <div class="tip-icon">💡</div>
            <p><strong>Celebration Ideas:</strong></p>
            <p>Consider sending a personal message, organizing a small team celebration, or coordinating a group card. Small gestures make big impacts! 🌟</p>
        </div>
        
        <div class="footer">
            <p>This reminder was sent to help you celebrate your colleagues' special days.<br>
            <span class="company-name">{{ config('app.name') }} HR Team</span></p>
            
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
                You can manage your birthday notification preferences in your email settings.
            </p>
        </div>
    </div>
</body>
</html>