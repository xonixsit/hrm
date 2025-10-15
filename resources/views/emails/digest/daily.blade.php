<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Digest</title>
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
            max-width: 600px;
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
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 25px 0;
        }
        .stat {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 24px;
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
        .no-activity {
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
            <h1>📊 Daily Digest</h1>
            <p>{{ $date }}</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Good morning, {{ $user->name }}! 👋
            </div>

            <!-- Statistics -->
            <div class="stats">
                <div class="stat">
                    <span class="stat-number">{{ $data['pending_leaves'] ?? 0 }}</span>
                    <span class="stat-label">Pending Leaves</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['pending_assessments'] ?? 0 }}</span>
                    <span class="stat-label">Pending Assessments</span>
                </div>
                <div class="stat">
                    <span class="stat-number">{{ $data['completed_today'] ?? 0 }}</span>
                    <span class="stat-label">Completed Today</span>
                </div>
            </div>

            <!-- Recent Leave Requests -->
            @if(!empty($data['recent_leaves']))
            <div class="section">
                <h3>🏖️ Recent Leave Requests</h3>
                @foreach($data['recent_leaves'] as $leave)
                <div class="item">
                    <div class="item-title">{{ $leave['employee_name'] }}</div>
                    <div class="item-meta">
                        {{ $leave['type'] }} • {{ $leave['dates'] }} • 
                        <span style="color: {{ $leave['status'] === 'approved' ? '#28a745' : ($leave['status'] === 'rejected' ? '#dc3545' : '#ffc107') }}">
                            {{ ucfirst($leave['status']) }}
                        </span>
                    </div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Recent Assessments -->
            @if(!empty($data['recent_assessments']))
            <div class="section">
                <h3>📋 Recent Assessments</h3>
                @foreach($data['recent_assessments'] as $assessment)
                <div class="item">
                    <div class="item-title">{{ $assessment['employee_name'] }}</div>
                    <div class="item-meta">
                        {{ $assessment['type'] }} Assessment • 
                        <span style="color: {{ $assessment['status'] === 'approved' ? '#28a745' : ($assessment['status'] === 'rejected' ? '#dc3545' : '#ffc107') }}">
                            {{ ucfirst($assessment['status']) }}
                        </span>
                    </div>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Action Items -->
            @if(!empty($data['action_items']))
            <div class="section">
                <h3>⚡ Action Items</h3>
                @foreach($data['action_items'] as $item)
                <div class="item">
                    <div class="item-title">{{ $item['title'] }}</div>
                    <div class="item-meta">{{ $item['description'] }}</div>
                </div>
                @endforeach
            </div>
            @endif

            @if(empty($data['recent_leaves']) && empty($data['recent_assessments']) && empty($data['action_items']))
            <div class="no-activity">
                <p>🌟 No new activity today. Enjoy your peaceful day!</p>
            </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ config('app.url') }}" class="btn">Open Xonixs HR</a>
            </div>
        </div>

        <div class="footer">
            <p>This is your daily digest from Xonixs HR System</p>
            <p><a href="{{ config('app.url') }}/email-preferences" style="color: #667eea;">Manage Email Preferences</a></p>
        </div>
    </div>
</body>
</html>