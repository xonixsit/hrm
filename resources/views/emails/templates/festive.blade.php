<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $broadcast->title }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: radial-gradient(circle at center, #ffecd2 0%, #fcb69f 100%); }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); padding: 50px 30px; text-align: center; color: #2d3748; position: relative; }
        .header::before { content: '🎊'; position: absolute; top: 20px; left: 30px; font-size: 24px; animation: bounce 2s infinite; }
        .header::after { content: '🎉'; position: absolute; top: 20px; right: 30px; font-size: 24px; animation: bounce 2s infinite 0.5s; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header .icon { font-size: 64px; margin-bottom: 20px; display: block; animation: pulse 2s infinite; }
        .content { padding: 40px 30px; background: linear-gradient(180deg, #ffffff 0%, #fef7f0 100%); }
        .content p { margin: 0 0 20px 0; font-size: 17px; line-height: 1.8; color: #2d3748; }
        .festive-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 30px 0; text-align: center; position: relative; }
        .festive-card::before { content: '✨'; position: absolute; top: 15px; left: 20px; font-size: 20px; }
        .festive-card::after { content: '✨'; position: absolute; bottom: 15px; right: 20px; font-size: 20px; }
        .festive-card h2 { margin: 0 0 15px 0; font-size: 24px; }
        .festive-card p { margin: 0; font-size: 16px; opacity: 0.95; }
        .celebration-border { height: 8px; background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff); margin: 30px 0; border-radius: 4px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b, #feca57); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: 600; margin: 25px 0; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); transition: transform 0.3s; }
        .button:hover { transform: translateY(-2px); }
        .footer { background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 35px 30px; text-align: center; }
        .footer p { margin: 0 0 10px 0; font-size: 14px; }
        .footer .company { font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .confetti { position: absolute; width: 10px; height: 10px; background: #ff6b6b; }
        .confetti:nth-child(1) { left: 10%; animation: fall 3s linear infinite; background: #feca57; }
        .confetti:nth-child(2) { left: 20%; animation: fall 3s linear infinite 0.5s; background: #48dbfb; }
        .confetti:nth-child(3) { left: 30%; animation: fall 3s linear infinite 1s; background: #ff9ff3; }
        @keyframes fall { 0% { transform: translateY(-100px) rotate(0deg); opacity: 1; } 100% { transform: translateY(600px) rotate(360deg); opacity: 0; } }
    </style>
</head>
<body>
    <div class="confetti"></div>
    <div class="confetti"></div>
    <div class="confetti"></div>
    
    <div class="container">
        <div class="header">
            <span class="icon">{{ $typeIcon }}</span>
            <h1>{{ $broadcast->title }}</h1>
        </div>
        
        <div class="content">
            {!! nl2br(e($broadcast->content)) !!}
            
            @if($broadcast->notes)
            <div class="festive-card">
                <h2>🌟 Special Message</h2>
                <p>{{ $broadcast->notes }}</p>
            </div>
            @endif
            
            <div class="celebration-border"></div>
            
            <div style="text-align: center;">
                <a href="{{ config('app.url') }}" class="button">🚀 Visit Dashboard</a>
            </div>
        </div>
        
        <div class="footer">
            <p class="company">{{ config('app.name') }}</p>
            <p>Spreading joy and celebrating together! 🎊</p>
            <p style="opacity: 0.8; font-size: 12px;">
                Sent by {{ $broadcast->createdBy->name }} • {{ $broadcast->sent_at?->format('M d, Y') }}
            </p>
        </div>
    </div>
</body>
</html>