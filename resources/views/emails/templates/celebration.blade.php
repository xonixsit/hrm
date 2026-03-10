<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $broadcast->title }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #ff6b6b, #feca57); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .header .icon { font-size: 48px; margin-bottom: 15px; display: block; }
        .content { padding: 40px 30px; line-height: 1.8; color: #333; }
        .content p { margin: 0 0 20px 0; font-size: 16px; }
        .highlight-box { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; margin: 30px 0; text-align: center; }
        .highlight-box h2 { margin: 0 0 15px 0; font-size: 24px; }
        .decorative-border { height: 4px; background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3); margin: 30px 0; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 0; font-size: 14px; opacity: 0.8; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .sparkles { position: relative; }
        .sparkles::before { content: '✨'; position: absolute; left: -30px; top: -10px; font-size: 20px; }
        .sparkles::after { content: '✨'; position: absolute; right: -30px; bottom: -10px; font-size: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="icon">{{ $typeIcon }}</span>
            <h1 class="sparkles">{{ $broadcast->title }}</h1>
        </div>
        
        <div class="content">
            {!! nl2br(e($broadcast->content)) !!}
            
            @if($broadcast->notes)
            <div class="highlight-box">
                <h2>Special Note</h2>
                <p style="margin: 0; font-size: 16px;">{{ $broadcast->notes }}</p>
            </div>
            @endif
            
            <div class="decorative-border"></div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{ config('app.url') }}" class="button">Visit Dashboard</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Sent by {{ $broadcast->createdBy->name }} • {{ $broadcast->sent_at?->format('M d, Y') }}</p>
        </div>
    </div>
</body>
</html>