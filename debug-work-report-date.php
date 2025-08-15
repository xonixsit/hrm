<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\WorkReport;

echo "=== Debugging Work Report Date Issue ===\n\n";

$user = User::where('email', 'employee@example.com')->first();

if (!$user || !$user->employee) {
    echo "❌ User or employee not found\n";
    exit(1);
}

// Get a specific work report (the one showing 8/14/2025 in the table)
$workReport = WorkReport::where('employee_id', $user->employee->id)
    ->where('date', '2025-08-14')
    ->first();

if (!$workReport) {
    echo "❌ Work report for 2025-08-14 not found\n";
    echo "Available dates:\n";
    $dates = WorkReport::where('employee_id', $user->employee->id)
        ->orderBy('date', 'desc')
        ->pluck('date')
        ->take(5);
    foreach ($dates as $date) {
        echo "   - {$date}\n";
    }
    exit(1);
}

echo "✅ Found work report for 2025-08-14\n\n";

echo "🔍 Database Values:\n";
echo "   - ID: {$workReport->id}\n";
echo "   - Date (raw): '{$workReport->date}'\n";
echo "   - Date type: " . gettype($workReport->date) . "\n";
echo "   - Date length: " . strlen($workReport->date) . "\n";
echo "   - Calls: {$workReport->calls}\n";
echo "   - Successful: {$workReport->successful_calls}\n";
echo "   - Not Received: {$workReport->calls_not_received}\n\n";

// Test how the date would be formatted for display in the table
echo "📅 Date Formatting Tests:\n";
echo "   - Raw date: '{$workReport->date}'\n";
echo "   - PHP date format: " . date('n/j/Y', strtotime($workReport->date)) . "\n";
echo "   - JavaScript new Date(): " . date('c', strtotime($workReport->date)) . "\n";
echo "   - For HTML input: {$workReport->date}\n\n";

// Test the JavaScript date parsing issue
echo "🧪 JavaScript Date Parsing Simulation:\n";
$timestamp = strtotime($workReport->date);
echo "   - Unix timestamp: {$timestamp}\n";
echo "   - UTC date: " . gmdate('Y-m-d', $timestamp) . "\n";
echo "   - Local date: " . date('Y-m-d', $timestamp) . "\n";

// Check timezone
echo "   - Server timezone: " . date_default_timezone_get() . "\n";
echo "   - Current time: " . date('Y-m-d H:i:s') . "\n\n";

echo "💡 The issue might be:\n";
echo "   1. Timezone differences between server and client\n";
echo "   2. JavaScript Date() constructor interpreting the date as UTC\n";
echo "   3. Date formatting inconsistencies\n\n";

echo "🎯 Expected behavior:\n";
echo "   - Table should show: 8/14/2025\n";
echo "   - Edit form should show: 08/14/2025 (same date)\n";