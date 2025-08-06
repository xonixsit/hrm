<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <title>@yield('title')</title>
    <style>
        body { font-family: 'Figtree', sans-serif; color: #333; }
        header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #dee2e6; }
        header h1 { margin: 0; font-size: 24px; }
        footer { text-align: center; padding: 10px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; position: fixed; bottom: 0; width: 100%; }
        .container { margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; }
        th { background-color: #e9ecef; }
    </style>
</head>
<body>
    <header>
        <h1>{{ config('app.name', 'Xonixs HRM') }} - @yield('report_type')</h1>
    </header>
    <div class="container">
        @yield('content')
    </div>
    <footer>
        Generated on {{ now()->format('Y-m-d H:i:s') }} | Page @yield('page', '1')
    </footer>
</body>
</html>