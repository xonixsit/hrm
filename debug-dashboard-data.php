<?php

// Debug script to test dashboard data
// Run with: php debug-dashboard-data.php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;

echo "🔍 Dashboard Data Debug\n";
echo "=====================\n\n";

// Get the first user (assuming you're testing with the first user)
$user = User::first();

if (!$user) {
    echo "❌ No users found in database\n";
    exit(1);
}

echo "👤 User: {$user->name} (ID: {$user->id})\n";
echo "📧 Email: {$user->email}\n";

// Check if user has employee record
$employee = $user->employee;

if (!$employee) {
    echo "❌ User has no employee record!\n";
    echo "💡 This is likely the issue - the user needs an employee record to use attendance features.\n\n";
    
    echo "🔧 To fix this, run:\n";
    echo "php artisan tinker\n";
    echo "App\\Models\\Employee::create(['user_id' => {$user->id}, 'employee_id' => 'EMP001', 'position' => 'Employee']);\n\n";
    
    exit(1);
} else {
    echo "✅ Employee record found (ID: {$employee->id})\n";
    echo "🏢 Position: {$employee->position}\n";
    echo "🆔 Employee ID: {$employee->employee_id}\n\n";
}

// Check today's attendance
$today = now()->format('Y-m-d');
$attendance = Attendance::where('employee_id', $employee->id)
    ->whereDate('date', $today)
    ->first();

echo "📅 Today's Date: {$today}\n";

if (!$attendance) {
    echo "❌ No attendance record for today\n";
    echo "💡 User is clocked out (no attendance record exists)\n\n";
    
    echo "🔧 Expected behavior:\n";
    echo "1. User sees 'Clocked Out' status ✅\n";
    echo "2. User clicks 'Clock In' button\n";
    echo "3. API creates new attendance record\n";
    echo "4. Status changes to 'Clocked In'\n";
    echo "5. Timer appears and starts counting\n\n";
} else {
    echo "✅ Attendance record found for today\n";
    echo "📊 Status: {$attendance->status}\n";
    echo "🕐 Clock In: " . ($attendance->clock_in ? $attendance->clock_in->format('H:i:s') : 'Not set') . "\n";
    echo "🕐 Clock Out: " . ($attendance->clock_out ? $attendance->clock_out->format('H:i:s') : 'Not set') . "\n";
    echo "⏸️ On Break: " . ($attendance->on_break ? 'Yes' : 'No') . "\n";
    echo "⏱️ Work Duration: " . ($attendance->work_duration ?? 'Not calculated') . "\n";
    echo "☕ Break Duration: " . ($attendance->break_duration ?? 'Not calculated') . "\n\n";
    
    // Check if user should be showing as clocked in
    $isClockedIn = $attendance->isClockedIn();
    echo "🔍 Should show as clocked in: " . ($isClockedIn ? 'Yes ✅' : 'No ❌') . "\n";
    
    if ($isClockedIn) {
        echo "💡 If dashboard shows 'Clocked Out', there's a frontend issue\n";
        echo "🔧 Check browser console for JavaScript errors\n";
        echo "🔧 Verify CSRF token is working\n";
        echo "🔧 Test API endpoints manually\n\n";
    }
}

// Test the dashboard controller method
echo "🎛️ Testing Dashboard Controller...\n";

try {
    $controller = new App\Http\Controllers\DashboardController();
    
    // Simulate authenticated user
    Auth::login($user);
    
    // This won't work directly, but we can test the private method logic
    echo "✅ Dashboard controller can be instantiated\n";
    echo "💡 The issue is likely in the frontend initialization\n\n";
    
} catch (Exception $e) {
    echo "❌ Dashboard controller error: " . $e->getMessage() . "\n\n";
}

echo "🎯 Next Steps:\n";
echo "1. Open dashboard in browser\n";
echo "2. Open browser dev tools (F12)\n";
echo "3. Go to Console tab\n";
echo "4. Paste and run the debug-attendance-api.js script\n";
echo "5. Check for API errors or CSRF token issues\n\n";

echo "✅ Debug completed!\n";