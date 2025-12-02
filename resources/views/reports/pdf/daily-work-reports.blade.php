<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Work Reports Summary - {{ $dateString }}</title>
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
        .stat-number {
            font-size: 20px;
            font-weight: bold;
            color: #667eea;
            display: block;
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
        <h1>📊 Daily Work Reports Summary</h1>
        <p>{{ $date }}</p>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell">
                    <span class="stat-number">{{ $data['total_reports'] }}</span>
                    <span class="stat-label">Total Reports</span>
                </div>
                <div class="stat-cell">
                    <span class="stat-number">{{ $data['total_voice_mails'] ?? 0 }}</span>
                    <span class="stat-label">Voice Mails</span>
                </div>
                <div class="stat-cell">
                    <span class="stat-number">{{ $data['total_interested'] ?? 0 }}</span>
                    <span class="stat-label">Interested</span>
                </div>
                <div class="stat-cell">
                    <span class="stat-number">{{ $data['total_not_interested'] ?? 0 }}</span>
                    <span class="stat-label">Not Interested</span>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-cell">
                    <span class="stat-number">{{ $data['employees_with_reports'] }}</span>
                    <span class="stat-label">Active Reporters</span>
                </div>
                <div class="stat-cell">
                    <span class="stat-number">{{ $data['active_employees'] }}</span>
                    <span class="stat-label">Total Employees</span>
                </div>
                <div class="stat-cell">
                    <span class="stat-number">{{ round(($data['employees_with_reports'] / max($data['active_employees'], 1)) * 100, 1) }}%</span>
                    <span class="stat-label">Participation Rate</span>
                </div>
                <div class="stat-cell">
                    <span class="stat-number">{{ ($data['total_interested'] ?? 0) + ($data['total_not_interested'] ?? 0) }}</span>
                    <span class="stat-label">Total Responses</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Top Performers -->
    @if(!empty($data['top_performers']))
    <div class="section">
        <h3>🏆 Top Performers</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Employee Name</th>
                    <th>Reports</th>
                    <th>Calls</th>
                    <th>Emails</th>
                    <th>WhatsApp</th>
                    <th>VMs</th>
                    <th>Interested</th>
                    <th>Not Interested</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_performers'] as $performer)
                <tr>
                    <td>{{ $performer['name'] }}</td>
                    <td>{{ $performer['report_count'] }}</td>
                    <td>{{ $performer['total_calls'] }}</td>
                    <td>{{ $performer['total_emails'] ?? 0 }}</td>
                    <td>{{ $performer['total_whatsapp'] ?? 0 }}</td>
                    <td>{{ $performer['total_voice_mails'] ?? 0 }}</td>
                    <td>{{ $performer['total_interested'] ?? 0 }}</td>
                    <td>{{ $performer['total_not_interested'] ?? 0 }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- All Reports -->
    @if(!empty($data['detailed_reports']))
    <div class="section">
        <h3>📋 All Work Reports ({{ count($data['detailed_reports']) }} employees)</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Employee Name</th>
                    <th>Reports</th>
                    <th>Calls</th>
                    <th>Emails</th>
                    <th>WhatsApp</th>
                    <th>VMs</th>
                    <th>Interested</th>
                    <th>Not Interested</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['detailed_reports'] as $report)
                <tr>
                    <td>{{ $report['name'] }}</td>
                    <td>{{ $report['report_count'] }}</td>
                    <td>{{ $report['total_calls'] }}</td>
                    <td>{{ $report['total_emails'] ?? 0 }}</td>
                    <td>{{ $report['total_whatsapp'] ?? 0 }}</td>
                    <td>{{ $report['total_voice_mails'] ?? 0 }}</td>
                    <td>{{ $report['total_interested'] ?? 0 }}</td>
                    <td>{{ $report['total_not_interested'] ?? 0 }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if(empty($data['detailed_reports']))
    <div class="no-data">
        <p>📝 No work reports submitted for {{ $dateString }}</p>
    </div>
    @endif

    <div class="footer">
        <p>Generated on {{ now()->format('F j, Y \a\t g:i A') }} | Xonixs HR System</p>
    </div>
</body>
</html>