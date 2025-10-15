<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Digest</title>
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
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }
        .stat {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
        .chart-section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .item {
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .item-meta {
            font-size: 14px;
            color: #666;
        }
        .highlight {
            background: linear-gradient(135deg, #667eea20, #764ba220);
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
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
            <h1>📈 Weekly Digest</h1>
            <p>{{ $weekStart }} - {{ $weekEnd }}</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello {{ $user->name }}! Here's your weekly summary 📊
            </div>

            <!-- Weekly Statistics -->
            <div class="stats-grid">
                <div class="stat">
                    <span class="stat-number">{{ $data['total_leaves'] ?? 0 }}</span>
                    <span class="stat-label">Leave Requests</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['total_assessments'] ?? 0 }}</span>
                    <span class="stat-label">Assessments</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['approved_items'] ?? 0 }}</span>
                    <span class="stat-label">Approved</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['pending_items'] ?? 0 }}</span>
                    <span class="stat-label">Pending</span>
                </div>
            </div>

            <!-- Performance Metrics -->
            @if(!empty($data['metrics']))
            <div class="chart-section">
                <h3>📊 Performance Metrics</h3>
                @foreach($data['metrics'] as $metric)
                <div style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>{{ $metric['label'] }}</span>
                        <span>{{ $metric['percentage'] }}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{ $metric['percentage'] }}%"></div>
                    </div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Weekly Highlights -->
            @if(!empty($data['highlights']))
            <div class="section">
                <h3>⭐ Weekly Highlights</h3>
                @foreach($data['highlights'] as $highlight)
                <div class="highlight">
                    <strong>{{ $highlight['title'] }}</strong><br>
                    {{ $highlight['description'] }}
                </div>
                @endforeach
            </div>
            @endif

            <!-- Top Activities -->
            @if(!empty($data['top_activities']))
            <div class="section">
                <h3>🔥 Top Activities This Week</h3>
                @foreach($data['top_activities'] as $activity)
                <div class="item">
                    <div class="item-title">{{ $activity['title'] }}</div>
                    <div class="item-meta">{{ $activity['count'] }} {{ $activity['type'] }} • {{ $activity['trend'] }}</div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Upcoming Items -->
            @if(!empty($data['upcoming']))
            <div class="section">
                <h3>📅 Coming Up Next Week</h3>
                @foreach($data['upcoming'] as $item)
                <div class="item">
                    <div class="item-title">{{ $item['title'] }}</div>
                    <div class="item-meta">{{ $item['date'] }} • {{ $item['type'] }}</div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Team Performance (for managers) -->
            @if(!empty($data['team_performance']))
            <div class="section">
                <h3>👥 Team Performance</h3>
                <div class="stats-grid">
                    @foreach($data['team_performance'] as $member)
                    <div class="stat">
                        <span class="stat-number">{{ $member['score'] }}</span>
                        <span class="stat-label">{{ $member['name'] }}</span>
                    </div>
                    @endforeach
                </div>
            </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ config('app.url') }}" class="btn">Open Xonixs HR</a>
                <a href="{{ config('app.url') }}/reports" class="btn">View Reports</a>
            </div>
        </div>

        <div class="footer">
            <p>This is your weekly digest from Xonixs HR System</p>
            <p><a href="{{ config('app.url') }}/email-preferences" style="color: #667eea;">Manage Email Preferences</a></p>
        </div>
    </div>
</body>
</html>