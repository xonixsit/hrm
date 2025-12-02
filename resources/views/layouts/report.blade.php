<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <title>@yield('title')</title>
    <style>
        body { 
            font-family: 'Figtree', sans-serif; 
            color: #333; 
            margin: 0; 
            padding: 0;
            line-height: 1.6;
        }
        header { 
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            padding: 30px 20px; 
            text-align: center; 
            border-bottom: 3px solid #0369a1;
        }
        header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
        }
        header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .container { 
            margin: 20px; 
            padding-bottom: 120px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            font-weight: 600;
            color: #374151;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .support-section {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #f8fafc;
            border-top: 2px solid #e5e7eb;
            padding: 15px 20px;
            font-size: 11px;
            color: #6b7280;
        }
        .support-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .support-item {
            text-align: center;
        }
        .support-item .icon {
            font-size: 16px;
            color: #0ea5e9;
            margin-bottom: 5px;
        }
        .support-item .label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 3px;
        }
        .support-item .value {
            color: #6b7280;
        }
        .generation-info {
            text-align: center;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <header>
        <h1>{{ config('app.name', 'Xonixs HRM') }} - @yield('report_type')</h1>
        <p>Professional Human Resource Management System</p>
    </header>
    <div class="container">
        @yield('content')
    </div>
    <div class="support-section">
        <div class="support-grid">
            <div class="support-item">
                <div class="icon">🏢</div>
                <div class="label">OFFICE ADDRESS</div>
                <div class="value">TX-61265, USA</div>
            </div>
            <div class="support-item">
                <div class="icon">📞</div>
                <div class="label">TELEPHONE NO.</div>
                <div class="value">+1 315-307-2751</div>
            </div>
            <div class="support-item">
                <div class="icon">📧</div>
                <div class="label">E-MAIL ADDRESS</div>
                <div class="value">Help@mysupertax.com</div>
            </div>
        </div>
        <div class="generation-info">
            Generated on {{ now()->format('F j, Y - g:i A') }} | For any queries regarding this report, please contact our support team
        </div>
    </div>
</body>
</html>