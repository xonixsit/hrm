<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Attendance Summary - {{ $dateString }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #667eea;
            font-size: 24px;
            margin: 0;
        }
        .header p {
            color: #666;
            margin: 5px 0 0 0;
        }
        .attendance-rate {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 10px;
        }
        .attendance-rate h3 {
            color: #333;
            margin-bottom: 10px;
        }
        .rate-number {
            font-size: 36px;
            font-weight: bold;
            color: {{ $data['attendance_rate'] >= 90 ? '#28a745' : ($data['attendance_rate'] >= 75 ? '#ffc107' : '#dc3545') }};
        }
        .stats-section {
            margin-bottom: 30px;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .stat-row {
            display: table-row;
        }
        .stat-cell {
            display: table-cell;
            width: 25%;
            padding: 15px;
            text-align: center;
            border: 1px solid #ddd;
            background-color: #f8f9fa;
        }
        .stat-cell.success {
            background-color: #d4edda;
            border-color: #28a745;
        }
        .stat-cell.danger {
            background-color: #f8d7da;
            border-color: #dc3545;
        }
        .stat-cell.warning {
            background-color: #fff3cd;
            border-color: #ffc107;
        }
        .stat-number {
            font-size: 20px;
            font-weight: bold;
            display: block;
        }
        .stat-number.success {
            color: #28a745;
        }
        .stat-number.danger {
            color: #dc3545;
        }
        .stat-number.warning {
            color: #ffc107;
        }
        .stat-number.primary {
            color: #667eea;
        }
        .stat-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h3 {
            color: #333;
            font-size: 16px;
            margin: 0 0 15px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table th,
        .table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .table th {
            background-color: #667eea;
            color: white;
            font-weight: bold;
        }
        .table tr:nth-child(even) {
            background-color: #f8f9fa;
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
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📅 Daily Attendance Summary</h1>
        <p>{{ $date }}</p>
    </div>

    <!-- Attendance Rate -->
    <div class="attendance-rate">
        <h3>Attendance Rate</h3>
        <div class="rate-number">{{ $data['attendance_rate'] }}%</div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell success">
                    <span class="stat-number success">{{ $data['present_count'] }}</span>
                    <span class="stat-label">Present</span>
                </div>
                <div class="stat-cell danger">
                    <span class="stat-number danger">{{ $data['absent_count'] }}</span>
                    <span class="stat-label">Absent</span>
                </div>
                <div class="stat-cell warning">
                    <span class="stat-number warning">{{ $data['late_arrivals'] }}</span>
                    <span class="stat-label">Late Arrivals</span>
                </div>
                <div class="stat-cell">
                    <span class="stat-number primary">{{ $data['average_work_hours'] }}</span>
                    <span class="stat-label">Avg Work Hours</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Top Performers -->
    @if(!empty($data['top_performers']))
    <div class="section">
        <h3>🏆 Top Performers by Work Hours</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Employee Name</th>
                    <th>Work Hours</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_performers'] as $performer)
                <tr>
                    <td>{{ $performer['name'] }}</td>
                    <td>{{ $performer['work_hours'] }}</td>
                    <td>{{ $performer['clock_in'] }}</td>
                    <td>{{ $performer['clock_out'] }}</td>
                    <td>
                        @if($performer['is_late'])
                            <span class="late-indicator">Late</span>
                        @else
                            On Time
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Present Employees -->
    @if(!empty($data['present_employees']))
    <div class="section">
        <h3>✅ Present Employees ({{ count($data['present_employees']) }})</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Employee Name</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Work Duration</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['present_employees'] as $employee)
                <tr>
                    <td>{{ $employee['name'] }}</td>
                    <td>{{ $employee['clock_in'] }}</td>
                    <td>{{ $employee['clock_out'] ?? 'Working' }}</td>
                    <td>{{ $employee['work_duration'] }}</td>
                    <td>
                        @if($employee['is_late'])
                            <span class="late-indicator">Late</span>
                        @else
                            On Time
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Absent Employees -->
    @if(!empty($data['absent_employees']))
    <div class="section">
        <h3>❌ Absent Employees ({{ count($data['absent_employees']) }})</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Employee Name</th>
                    <th>Employee ID</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['absent_employees'] as $employee)
                <tr>
                    <td>{{ $employee['name'] }}</td>
                    <td>{{ $employee['employee_id'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if(empty($data['present_employees']) && empty($data['absent_employees']))
    <div class="no-data">
        <p>📊 No attendance data available for {{ $dateString }}</p>
    </div>
    @endif

    <div class="footer">
        <p>Generated on {{ now()->format('F j, Y \a\t g:i A') }} | Xonixs HR System</p>
    </div>
</body>
</html>