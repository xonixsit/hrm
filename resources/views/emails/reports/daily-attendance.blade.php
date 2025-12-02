<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Attendance Summary</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            max-width: 650px;
            margin: 20px auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #555;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }
        .stat {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
            display: block;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat.success .stat-number {
            color: #28a745;
        }
        .stat.warning .stat-number {
            color: #ffc107;
        }
        .stat.danger .stat-number {
            color: #dc3545;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .section h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .employee-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        .employee-row:last-child {
            border-bottom: none;
        }
        .employee-name {
            font-weight: 600;
            color: #333;
        }
        .employee-time {
            font-size: 14px;
            color: #666;
        }
        .late-indicator {
            color: #dc3545;
            font-weight: bold;
        }
        .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .btn {
            display: inline-block;
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px 5px;
            font-weight: 500;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .progress-bar {
            background: #e9ecef;
            border-radius: 10px;
            height: 8px;
            margin: 10px 0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            border-radius: 10px;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Daily Attendance Summary</h1>
            <p>{{ $date }}</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello {{ $user->name }}, here's your daily attendance summary 📊
            </div>

            <!-- Attendance Rate Progress -->
            <div style="text-align: center; margin: 25px 0;">
                <h3 style="color: #333; margin-bottom: 10px;">Attendance Rate</h3>
                <div style="font-size: 36px; font-weight: bold; color: {{ $data['attendance_rate'] >= 90 ? '#28a745' : ($data['attendance_rate'] >= 75 ? '#ffc107' : '#dc3545') }};">
                    {{ $data['attendance_rate'] }}%
                </div>
                <div class="progress-bar" style="max-width: 300px; margin: 15px auto;">
                    <div class="progress-fill" style="width: {{ $data['attendance_rate'] }}%"></div>
                </div>
            </div>

            <!-- Statistics -->
            <div class="stats-grid">
                <div class="stat success">
                    <span class="stat-number">{{ $data['present_count'] }}</span>
                    <span class="stat-label">Present</span>
                </div>
                <div class="stat danger">
                    <span class="stat-number">{{ $data['absent_count'] }}</span>
                    <span class="stat-label">Absent</span>
                </div>
                <div class="stat warning">
                    <span class="stat-number">{{ $data['late_arrivals'] }}</span>
                    <span class="stat-label">Late Arrivals</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['average_work_hours'] }}</span>
                    <span class="stat-label">Avg Work Hours</span>
                </div>
            </div>

            <!-- Top Performers -->
            @if(!empty($data['top_performers']))
            <div class="section">
                <h3>🏆 Top Performers by Work Hours</h3>
                @foreach($data['top_performers'] as $performer)
                <div class="employee-row">
                    <div class="employee-name">
                        {{ $performer['name'] }}
                        @if($performer['is_late'])
                            <span class="late-indicator">(Late)</span>
                        @endif
                    </div>
                    <div class="employee-time">
                        {{ $performer['work_hours'] }} • In: {{ $performer['clock_in'] }} • Out: {{ $performer['clock_out'] }}
                    </div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Present Employees -->
            @if(!empty($data['present_employees']))
            <div class="section">
                <h3>✅ Present Employees ({{ count($data['present_employees']) }})</h3>
                @if(count($data['present_employees']) > 10)
                    <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                        Showing first 10 employees. <a href="{{ route('attendances.index') }}" style="color: #667eea;">View all attendance</a>
                    </p>
                @endif
                
                @foreach(array_slice($data['present_employees'], 0, 10) as $employee)
                <div class="employee-row">
                    <div class="employee-name">
                        {{ $employee['name'] }}
                        @if($employee['is_late'])
                            <span class="late-indicator">(Late)</span>
                        @endif
                    </div>
                    <div class="employee-time">
                        In: {{ $employee['clock_in'] }} • 
                        Out: {{ $employee['clock_out'] ?? 'Working' }} • 
                        Duration: {{ $employee['work_duration'] }}
                    </div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Absent Employees -->
            @if(!empty($data['absent_employees']))
            <div class="section">
                <h3>❌ Absent Employees ({{ count($data['absent_employees']) }})</h3>
                @if(count($data['absent_employees']) > 10)
                    <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                        Showing first 10 employees.
                    </p>
                @endif
                
                @foreach(array_slice($data['absent_employees'], 0, 10) as $employee)
                <div class="employee-row">
                    <div class="employee-name">{{ $employee['name'] }}</div>
                    <div class="employee-time">ID: {{ $employee['employee_id'] }}</div>
                </div>
                @endforeach
            </div>
            @endif

            @if(empty($data['present_employees']) && empty($data['absent_employees']))
            <div class="no-data">
                <p>📊 No attendance data available for {{ $dateString }}</p>
            </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ route('attendances.index') }}" class="btn">View All Attendance</a>
                <a href="{{ route('dashboard') }}" class="btn">Open Dashboard</a>
            </div>
        </div>

        <div class="footer">
            <p>This is your daily attendance summary from Xonixs HR System</p>
            <p><a href="{{ route('email-preferences.show') }}" style="color: #667eea;">Manage Email Preferences</a></p>
        </div>
    </div>
</body>
</html>