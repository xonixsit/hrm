<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Happy Birthday!</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        .birthday-header {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .birthday-title {
            color: #667eea;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .employee-name {
            color: #764ba2;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .birthday-message {
            font-size: 18px;
            color: #555;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .age-badge {
            display: inline-block;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
        }
        .celebration-section {
            background: #f8f9ff;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
        }
        .balloons {
            font-size: 24px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .company-name {
            color: #667eea;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="birthday-header">🎉🎂🎈</div>
        
        <h1 class="birthday-title">Happy Birthday!</h1>
        <h2 class="employee-name">{{ $employee->getFullName() }}</h2>
        
        @if($age)
            <div class="age-badge">
                Celebrating {{ $age }} wonderful years! 🎊
            </div>
        @endif
        
        <div class="birthday-message">
            <p>Today is your special day, and we want you to know how much you mean to our team! 🌟</p>
            
            <p>Your dedication, creativity, and positive energy make our workplace a better place every day. We're grateful to have you as part of our family.</p>
        </div>
        
        <div class="celebration-section">
            <div class="balloons">🎈🎈🎈🎈🎈</div>
            <p><strong>May this new year of life bring you:</strong></p>
            <p>✨ Joy and happiness in everything you do<br>
            🚀 Success in all your endeavors<br>
            💫 Amazing memories with loved ones<br>
            🎯 Achievement of all your dreams</p>
        </div>
        
        <div class="birthday-message">
            <p>We hope your birthday is filled with laughter, love, and all your favorite things! 🎁</p>
            
            <p><strong>Enjoy your special day – you deserve all the celebration! 🥳</strong></p>
        </div>
        
        <div class="footer">
            <p>With warmest birthday wishes,<br>
            <span class="company-name">The {{ config('app.name') }} Team</span></p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated birthday greeting from our HR system. 
                We hope it brings a smile to your face! 😊
            </p>
        </div>
    </div>
</body>
</html>