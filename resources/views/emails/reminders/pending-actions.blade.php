<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pending Actions Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
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
            background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .urgency-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #555;
        }
        .pending-item {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #ff6b6b;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .item-title {
            font-weight: 600;
            color: #333;
            font-size: 16px;
        }
        .item-type {
            background: #ff6b6b;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .item-details {
            color: #666;
            margin-bottom: 10px;
        }
        .item-meta {
            font-size: 14px;
            color: #888;
        }
        .urgency-high {
            border-left-color: #dc3545;
            background: #fff5f5;
        }
        .urgency-medium {
            border-left-color: #ffc107;
            background: #fffbf0;
        }
        .urgency-low {
            border-left-color: #28a745;
            background: #f8fff8;
        }
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 25px;
            background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
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
        .btn-secondary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 25px 0;
        }
        .summary-number {
            font-size: 36px;
            font-weight: bold;
            color: #ff6b6b;
            display: block;
        }
        .summary-text {
            color: #666;
            margin-top: 5px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Pending Actions</h1>
            <div class="urgency-badge">Requires Your Attention</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hi {{ $user->name }}, 👋
            </div>

            <div class="summary">
                <span class="summary-number">{{ $count }}</span>
                <div class="summary-text">
                    {{ $count === 1 ? 'item requires' : 'items require' }} your immediate attention
                </div>
            </div>

            @foreach($pendingItems as $item)
            <div class="pending-item urgency-{{ $item['urgency'] ?? 'medium' }}">
                <div class="item-header">
                    <div class="item-title">{{ $item['title'] }}</div>
                    <div class="item-type">{{ $item['type'] }}</div>
                </div>
                
                <div class="item-details">
                    {{ $item['description'] }}
                </div>
                
                <div class="item-meta">
                    @if(isset($item['submitted_date']))
                        Submitted: {{ $item['submitted_date'] }}
                    @endif
                    @if(isset($item['days_pending']))
                        • Pending for {{ $item['days_pending'] }} {{ $item['days_pending'] === 1 ? 'day' : 'days' }}
                    @endif
                    @if(isset($item['employee']))
                        • Employee: {{ $item['employee'] }}
                    @endif
                </div>
            </div>
            @endforeach

            <div class="action-buttons">
                <a href="{{ config('app.url') }}/dashboard" class="btn">Review All Items</a>
                @if($count > 1)
                    <a href="{{ config('app.url') }}/bulk-actions" class="btn btn-secondary">Bulk Actions</a>
                @endif
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <strong>💡 Quick Tip:</strong> You can process multiple items at once using our bulk action feature to save time!
            </div>
        </div>

        <div class="footer">
            <p>This reminder was sent because you have pending items requiring attention.</p>
            <p><a href="{{ config('app.url') }}/email-preferences" style="color: #ff6b6b;">Manage Reminder Settings</a></p>
        </div>
    </div>
</body>
</html>