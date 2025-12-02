<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Work Reports Summary</title>
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
        .employee-stats {
            font-size: 14px;
            color: #666;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Daily Work Reports Summary</h1>
            <p>{{ $date }}</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello {{ $user->name }}, here's your daily work reports summary 📈
            </div>

            <!-- Statistics -->
            <div class="stats-grid">
                <div class="stat">
                    <span class="stat-number">{{ $data['total_reports'] }}</span>
                    <span class="stat-label">Total Reports</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['total_voice_mails'] ?? 0 }}</span>
                    <span class="stat-label">Voice Mails</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['total_interested'] ?? 0 }}</span>
                    <span class="stat-label">Interested</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['total_not_interested'] ?? 0 }}</span>
                    <span class="stat-label">Not Interested</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['employees_with_reports'] }}</span>
                    <span class="stat-label">Active Reporters</span>
                </div>
            </div>

            <!-- Top Performers -->
            @if(!empty($data['top_performers']))
            <div class="section">
                <h3>🏆 Top Performers</h3>
                @foreach($data['top_performers'] as $performer)
                <div class="employee-row">
                    <div class="employee-name">{{ $performer['name'] }}</div>
                    <div class="employee-stats">
                        📊 {{ $performer['report_count'] }} reports • 
                        📞 {{ $performer['total_calls'] }} calls • 
                        📧 {{ $performer['total_emails'] ?? 0 }} emails • 
                        💬 {{ $performer['total_whatsapp'] ?? 0 }} WhatsApp<br>
                        📨 {{ $performer['total_voice_mails'] ?? 0 }} VMs • 
                        ✅ {{ $performer['total_interested'] ?? 0 }} interested • 
                        ❌ {{ $performer['total_not_interested'] ?? 0 }} not interested
                    </div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- All Reports -->
            @if(!empty($data['detailed_reports']))
            <div class="section">
                <h3>📋 All Work Reports ({{ count($data['detailed_reports']) }} employees)</h3>
                @if(count($data['detailed_reports']) > 10)
                    <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                        Showing top 10 performers. <a href="{{ route('work-reports.index') }}" style="color: #667eea;">View all reports</a>
                    </p>
                @endif
                
                @foreach(array_slice($data['detailed_reports'], 0, 10) as $report)
                <div class="employee-row">
                    <div class="employee-name">{{ $report['name'] }}</div>
                    <div class="employee-stats">
                        📊 {{ $report['report_count'] }} reports • 
                        📞 {{ $report['total_calls'] }} calls • 
                        📧 {{ $report['total_emails'] ?? 0 }} emails • 
                        💬 {{ $report['total_whatsapp'] ?? 0 }} WhatsApp<br>
                        📨 {{ $report['total_voice_mails'] ?? 0 }} VMs • 
                        ✅ {{ $report['total_interested'] ?? 0 }} interested • 
                        ❌ {{ $report['total_not_interested'] ?? 0 }} not interested
                    </div>
                </div>
                @endforeach
            </div>
            @endif

            @if(empty($data['detailed_reports']))
            <div class="no-data">
                <p>📝 No work reports submitted for {{ $dateString }}</p>
            </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ route('work-reports.index') }}" class="btn">View All Reports</a>
                <a href="{{ route('dashboard') }}" class="btn">Open Dashboard</a>
            </div>
        </div>

        <div class="footer">
            <p>This is your daily work reports summary from Xonixs HR System</p>
            <p><a href="{{ route('email-preferences.show') }}" style="color: #667eea;">Manage Email Preferences</a></p>
        </div>
    </div>
</body>
</html>