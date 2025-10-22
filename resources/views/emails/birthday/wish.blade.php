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
            @if($employee->gender === 'female')
                background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
            @else
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            @endif
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
            @if($employee->gender === 'female')
                color: #ff6b9d;
            @else
                color: #667eea;
            @endif
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .employee-name {
            @if($employee->gender === 'female')
                color: #c44569;
            @else
                color: #764ba2;
            @endif
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
            @if($employee->gender === 'female')
                background: linear-gradient(45deg, #ff6b9d, #c44569);
            @else
                background: linear-gradient(45deg, #667eea, #764ba2);
            @endif
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
        }
        .celebration-section {
            @if($employee->gender === 'female')
                background: #fff0f5;
            @else
                background: #f8f9ff;
            @endif
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
            @if($employee->gender === 'female')
                color: #ff6b9d;
            @else
                color: #667eea;
            @endif
            font-weight: bold;
        }
        .logo {
            max-width: 120px;
            height: auto;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="birthday-header">
            @if($employee->gender === 'female')
                🎉🌸🎂🌺🎈
            @else
                🎉🎂🎈🎊🎁
            @endif
        </div>
        
        <h1 class="birthday-title">Happy Birthday!</h1>
        <h2 class="employee-name">{{ $employee->getFullName() }}</h2>
        
        @if($age)
            <div class="age-badge">
                Celebrating {{ $age }} wonderful years! 🎊
            </div>
        @endif
        
        <div class="birthday-message">
            @if($employee->gender === 'female')
                <p>Today is your special day, beautiful! We want you to know how much you mean to our team! ✨</p>
                <p>Your grace, wisdom, and inspiring presence make our workplace shine brighter every day. We're blessed to have such an amazing woman as part of our family.</p>
            @else
                <p>Today is your special day, and we want you to know how much you mean to our team! 🌟</p>
                <p>Your dedication, leadership, and positive energy make our workplace a better place every day. We're grateful to have you as part of our family.</p>
            @endif
        </div>
        
        <div class="celebration-section">
            @if($employee->gender === 'female')
                <div class="balloons">🌸🎈💐🎈🌸</div>
                <p><strong>May this new year of life bring you:</strong></p>
                <p>✨ Endless joy and beautiful moments<br>
                🌺 Success that blooms in all you do<br>
                💖 Love and laughter with cherished ones<br>
                🦋 Dreams that take flight and come true</p>
            @else
                <div class="balloons">🎈🎈🎈🎈🎈</div>
                <p><strong>May this new year of life bring you:</strong></p>
                <p>✨ Joy and happiness in everything you do<br>
                🚀 Success in all your endeavors<br>
                💫 Amazing memories with loved ones<br>
                🎯 Achievement of all your dreams</p>
            @endif
        </div>
        
        <div class="birthday-message">
            <p>We hope your birthday is filled with laughter, love, and all your favorite things! 🎁</p>
            
            <p><strong>Enjoy your special day – you deserve all the celebration! 🥳</strong></p>
        </div>
        
        <div class="footer">
            <p>With warmest birthday wishes,<br>
            <span class="company-name">The Xonobics Team</span></p>
            
            <!-- Xonobics Logo -->
            <div style="margin: 30px 0;">
                <svg class="logo" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
                    <text x="10" y="35" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
                          fill="@if($employee->gender === 'female') #ff6b9d @else #667eea @endif">
                        XONOBICS
                    </text>
                </svg>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated birthday greeting from our HR system. 
                We hope it brings a smile to your face! 😊
            </p>
        </div>
    </div>
</body>
</html>