<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Work Reports Summary - {{ config('app.name') }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
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
            border-bottom: 2px solid #3b82f6;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        .summary-box {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .summary-box h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .performers-section {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .performer-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .performer-item:last-child {
            border-bottom: none;
        }
        .performer-name {
            font-weight: 500;
            color: #374151;
        }
        .performer-stats {
            font-size: 14px;
            color: #6b7280;
        }
        .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background: #1d4ed8;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .highlight {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .highlight strong {
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📊 {{ config('app.name') }}</div>
            <p style="margin: 0; color: #6b7280;">Daily Work Reports Summary</p>
        </div>

        <div class="greeting">
            Good morning, <strong>{{ $recipient->name }}</strong>! 👋
        </div>

        <div class="summary-box">
            <h3>📈 Work Reports Summary</h3>
            <p>{{ $date->format('l, F j, Y') }}</p>
        </div>

        <!-- Key Statistics -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">{{ $workReportsData['total_reports'] }}</div>
                <div class="stat-label">Total Reports</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ $workReportsData['total_emails'] ?? 0 }}</div>
                <div class="stat-label">Emails</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ $workReportsData['total_whatsapp'] ?? 0 }}</div>
                <div class="stat-label">WhatsApp</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ $workReportsData['total_voice_mails'] ?? 0 }}</div>
                <div class="stat-label">Voice Mails</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ $workReportsData['total_interested'] ?? 0 }}</div>
                <div class="stat-label">Interested</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ $workReportsData['total_not_interested'] ?? 0 }}</div>
                <div class="stat-label">Not Interested</div>
            </div>
        </div>

        <!-- Performance Insights -->
        @if($workReportsData['total_reports'] > 0)
            <div class="highlight">
                <p><strong>📊 Performance Insights:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li><strong>Participation Rate:</strong> {{ round(($workReportsData['employees_with_reports'] / $workReportsData['active_employees']) * 100, 1) }}% of employees submitted reports</li>
                    <li><strong>Average Interested per Employee:</strong> {{ $workReportsData['employees_with_reports'] > 0 ? round($workReportsData['total_interested'] / $workReportsData['employees_with_reports'], 1) : 0 }} interested responses</li>
                    <li><strong>Reports per Active Employee:</strong> {{ $workReportsData['employees_with_reports'] > 0 ? round($workReportsData['total_reports'] / $workReportsData['employees_with_reports'], 1) : 0 }} reports on average</li>
                </ul>
            </div>
        @endif

        <!-- Top Performers -->
        @if(count($workReportsData['top_performers']) > 0)
            <div class="performers-section">
                <h4 style="margin-top: 0; color: #1e40af;">🏆 Top Performers</h4>
                @foreach($workReportsData['top_performers'] as $performer)
                    <div class="performer-item">
                        <div>
                            <div class="performer-name">{{ $performer['name'] }}</div>
                        </div>
                        <div class="performer-stats">
                            {{ $performer['report_count'] }} reports • {{ number_format($performer['total_calls']) }} calls
                        </div>
                    </div>
                @endforeach
            </div>
        @endif

        <!-- No Activity Alert -->
        @if($workReportsData['total_reports'] == 0)
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h4 style="color: #dc2626; margin-top: 0;">⚠️ No Work Reports Submitted</h4>
                <p style="color: #7f1d1d; margin-bottom: 0;">No employees submitted work reports for {{ $date->format('F j, Y') }}. Consider sending reminders to encourage daily reporting.</p>
            </div>
        @endif

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $reportsUrl }}" class="cta-button">
                📊 View Detailed Reports
            </a>
            <a href="{{ $dashboardUrl }}" class="cta-button" style="margin-left: 10px; background: #059669;">
                🏠 Go to Dashboard
            </a>
        </div>

        <!-- Additional Information -->
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0;"><strong>💡 Quick Actions:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #065f46;">
                <li>Review individual employee performance in the reports section</li>
                <li>Follow up with employees who haven't submitted reports</li>
                <li>Analyze trends and patterns in work report data</li>
                <li>Provide feedback and recognition to top performers</li>
            </ul>
        </div>

        <div class="footer">
            <p>
                <strong>{{ config('app.name') }}</strong><br>
                This is an automated daily summary. Please do not reply to this email.
            </p>
            <p style="margin-top: 10px;">
                Report generated on {{ now()->format('F j, Y \a\t g:i A') }}
            </p>
            <p style="margin-top: 15px; font-size: 12px;">
                Recipient: {{ $recipient->name }} ({{ $recipient->email }})
            </p>
        </div>
    </div>
</body>
</html>