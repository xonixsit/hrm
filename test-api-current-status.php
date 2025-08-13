<?php
// Simple test script to check the current attendance status API
// This should be run from the Laravel application root

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Auth;

// Create a simple test to check if the API endpoint is working
echo "Testing Attendance API Endpoints\n";
echo "================================\n\n";

// Test 1: Check if routes are defined
echo "1. Checking if routes are defined...\n";

try {
    $routes = \Illuminate\Support\Facades\Route::getRoutes();
    $attendanceRoutes = [];
    
    foreach ($routes as $route) {
        $uri = $route->uri();
        if (strpos($uri, 'api/attendance') !== false) {
            $attendanceRoutes[] = [
                'method' => implode('|', $route->methods()),
                'uri' => $uri,
                'action' => $route->getActionName()
            ];
        }
    }
    
    if (empty($attendanceRoutes)) {
        echo "❌ No attendance API routes found!\n";
    } else {
        echo "✅ Found " . count($attendanceRoutes) . " attendance API routes:\n";
        foreach ($attendanceRoutes as $route) {
            echo "   {$route['method']} /{$route['uri']} -> {$route['action']}\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error checking routes: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Check if AttendanceController methods exist
echo "2. Checking AttendanceController methods...\n";

$controller = new AttendanceController();
$methods = ['getCurrentStatus', 'clockIn', 'clockOut', 'startBreak', 'endBreak'];

foreach ($methods as $method) {
    if (method_exists($controller, $method)) {
        echo "✅ Method {$method} exists\n";
    } else {
        echo "❌ Method {$method} missing\n";
    }
}

echo "\n";

// Test 3: Check database connection and tables
echo "3. Checking database and tables...\n";

try {
    // Check if attendances table exists
    $tableExists = \Illuminate\Support\Facades\Schema::hasTable('attendances');
    if ($tableExists) {
        echo "✅ Attendances table exists\n";
        
        // Check required columns
        $requiredColumns = [
            'employee_id', 'date', 'clock_in', 'clock_out', 
            'on_break', 'current_break_start', 'break_sessions', 
            'total_break_minutes', 'status'
        ];
        
        foreach ($requiredColumns as $column) {
            if (\Illuminate\Support\Facades\Schema::hasColumn('attendances', $column)) {
                echo "✅ Column '{$column}' exists\n";
            } else {
                echo "❌ Column '{$column}' missing\n";
            }
        }
    } else {
        echo "❌ Attendances table does not exist\n";
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 4: Check if Attendance model methods exist
echo "4. Checking Attendance model methods...\n";

try {
    $attendance = new \App\Models\Attendance();
    $modelMethods = ['startBreak', 'endBreak', 'calculateWorkMinutes', 'isClockedIn'];
    
    foreach ($modelMethods as $method) {
        if (method_exists($attendance, $method)) {
            echo "✅ Model method {$method} exists\n";
        } else {
            echo "❌ Model method {$method} missing\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Model error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 5: Check middleware and authentication
echo "5. Checking middleware configuration...\n";

try {
    $middlewareGroups = config('app.middleware_groups', []);
    if (isset($middlewareGroups['web'])) {
        echo "✅ Web middleware group configured\n";
    } else {
        echo "❌ Web middleware group missing\n";
    }
    
    if (class_exists('\App\Http\Middleware\VerifyCsrfToken')) {
        echo "✅ CSRF middleware exists\n";
    } else {
        echo "❌ CSRF middleware missing\n";
    }
} catch (Exception $e) {
    echo "❌ Middleware check error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 6: Sample data check
echo "6. Checking for sample data...\n";

try {
    $userCount = \App\Models\User::count();
    $employeeCount = \App\Models\Employee::count();
    $attendanceCount = \App\Models\Attendance::count();
    
    echo "✅ Users: {$userCount}\n";
    echo "✅ Employees: {$employeeCount}\n";
    echo "✅ Attendance records: {$attendanceCount}\n";
    
    if ($userCount === 0) {
        echo "⚠️  No users found - you may need to create test users\n";
    }
    
    if ($employeeCount === 0) {
        echo "⚠️  No employees found - you may need to create employee records\n";
    }
} catch (Exception $e) {
    echo "❌ Data check error: " . $e->getMessage() . "\n";
}

echo "\n";

echo "Test Summary:\n";
echo "=============\n";
echo "If all tests show ✅, the attendance system should be working.\n";
echo "If you see ❌ or ⚠️, those issues need to be addressed.\n\n";

echo "To test the API endpoints manually:\n";
echo "1. Make sure you're logged in to the application\n";
echo "2. Open the browser developer tools (F12)\n";
echo "3. Go to the Console tab\n";
echo "4. Run these commands:\n\n";

echo "// Test current status\n";
echo "fetch('/api/attendance/current', {\n";
echo "  method: 'GET',\n";
echo "  headers: {\n";
echo "    'Content-Type': 'application/json',\n";
echo "    'Accept': 'application/json',\n";
echo "    'X-Requested-With': 'XMLHttpRequest'\n";
echo "  }\n";
echo "}).then(r => r.json()).then(console.log)\n\n";

echo "// Test clock in\n";
echo "fetch('/api/attendance/clock-in', {\n";
echo "  method: 'POST',\n";
echo "  headers: {\n";
echo "    'Content-Type': 'application/json',\n";
echo "    'Accept': 'application/json',\n";
echo "    'X-Requested-With': 'XMLHttpRequest',\n";
echo "    'X-CSRF-TOKEN': document.querySelector('meta[name=\"csrf-token\"]').getAttribute('content')\n";
echo "  },\n";
echo "  body: JSON.stringify({})\n";
echo "}).then(r => r.json()).then(console.log)\n\n";

echo "Run this script with: php test-api-current-status.php\n";
?>