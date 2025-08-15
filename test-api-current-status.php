<?php

// Test the current status API endpoint directly
echo "🧪 Testing Attendance API Current Status Endpoint\n";
echo "================================================\n\n";

// Test 1: Check if the route exists
echo "1. Testing route accessibility...\n";
$url = 'http://localhost/api/attendance/current';

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Accept: application/json',
            'X-Requested-With: XMLHttpRequest'
        ]
    ]
]);

try {
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Failed to connect to API endpoint\n";
        echo "Make sure the Laravel server is running: php artisan serve\n";
    } else {
        echo "✅ API endpoint is accessible\n";
        echo "Response: " . substr($response, 0, 200) . "...\n\n";
        
        // Try to decode JSON
        $data = json_decode($response, true);
        if ($data) {
            echo "✅ Valid JSON response received\n";
            echo "Response structure:\n";
            foreach ($data as $key => $value) {
                echo "  - $key: " . (is_array($value) ? 'array' : gettype($value)) . "\n";
            }
        } else {
            echo "❌ Invalid JSON response\n";
            echo "Raw response: $response\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n2. Testing with Laravel artisan command...\n";

// Test using artisan tinker equivalent
$testScript = '
<?php
require_once "vendor/autoload.php";

$app = require_once "bootstrap/app.php";
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;

echo "Testing database connectivity...\n";

try {
    $userCount = User::count();
    echo "✅ Users in database: $userCount\n";
    
    $employeeCount = Employee::count();
    echo "✅ Employees in database: $employeeCount\n";
    
    $attendanceCount = Attendance::count();
    echo "✅ Attendance records: $attendanceCount\n";
    
    // Test getting a user with employee
    $user = User::with("employee")->find(4); // Employee User
    if ($user && $user->employee) {
        echo "✅ Employee User found with employee record\n";
        echo "   Employee ID: " . $user->employee->id . "\n";
        echo "   Employee Code: " . $user->employee->employee_code . "\n";
        
        // Test getting current attendance
        $today = now()->format("Y-m-d");
        $attendance = Attendance::where("employee_id", $user->employee->id)
            ->whereDate("date", $today)
            ->first();
            
        if ($attendance) {
            echo "✅ Found attendance record for today\n";
            echo "   Status: " . $attendance->status . "\n";
            echo "   Clocked In: " . ($attendance->isClockedIn() ? "Yes" : "No") . "\n";
        } else {
            echo "ℹ️ No attendance record for today (this is normal)\n";
        }
    } else {
        echo "❌ Employee User not found or missing employee record\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
';

file_put_contents('temp_test.php', $testScript);
$output = shell_exec('php temp_test.php 2>&1');
echo $output;
unlink('temp_test.php');

echo "\n3. Recommendations:\n";
echo "- Make sure Laravel server is running: php artisan serve\n";
echo "- Check if you're logged in to the application\n";
echo "- Verify the Employee User has an employee record\n";
echo "- Test the clock in button in the actual dashboard\n";