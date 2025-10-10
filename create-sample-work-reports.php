<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\WorkReport;
use App\Models\Employee;
use Carbon\Carbon;

echo "=== CREATING SAMPLE WORK REPORTS ===\n\n";

// Get all employees
$employees = Employee::with('user')->get();

if ($employees->isEmpty()) {
    echo "❌ No employees found! Please create employees first.\n";
    exit(1);
}

echo "👥 Found {$employees->count()} employees\n";

// Clear existing work reports
WorkReport::truncate();
echo "🗑️ Cleared existing work reports\n";

// Create work reports for different date ranges
$dates = [];

// This week (7 days)
for ($i = 0; $i < 7; $i++) {
    $dates[] = Carbon::now()->subDays($i)->format('Y-m-d');
}

// This month (additional days)
for ($i = 7; $i < 30; $i++) {
    if (rand(1, 3) === 1) { // 33% chance for each day
        $dates[] = Carbon::now()->subDays($i)->format('Y-m-d');
    }
}

// This year (additional months)
for ($i = 1; $i < 12; $i++) {
    for ($j = 0; $j < rand(2, 8); $j++) { // 2-8 reports per month
        $dates[] = Carbon::now()->subMonths($i)->subDays(rand(0, 28))->format('Y-m-d');
    }
}

$dates = array_unique($dates);
sort($dates);

echo "📅 Will create reports for " . count($dates) . " different dates\n";
echo "📊 Date range: " . min($dates) . " to " . max($dates) . "\n\n";

$totalReports = 0;

foreach ($employees as $employee) {
    $employeeReports = 0;
    
    // Each employee gets reports for random dates
    $employeeDates = array_rand(array_flip($dates), min(count($dates), rand(10, 25)));
    if (!is_array($employeeDates)) {
        $employeeDates = [$employeeDates];
    }
    
    foreach ($employeeDates as $date) {
        // Generate realistic call data
        $totalCalls = rand(5, 50);
        $successfulCalls = rand(0, $totalCalls);
        $notReceived = rand(0, $totalCalls - $successfulCalls);
        $disconnected = rand(0, $totalCalls - $successfulCalls - $notReceived);
        $followUp = max(0, $totalCalls - $successfulCalls - $notReceived - $disconnected);
        
        WorkReport::create([
            'employee_id' => $employee->id,
            'date' => $date,
            'calls' => $totalCalls,
            'successful_calls' => $successfulCalls,
            'calls_not_received' => $notReceived,
            'disconnected_calls' => $disconnected,
            'follow_up_calls' => $followUp,
            'emails' => rand(0, 20),
            'whatsapp' => rand(0, 15),
            'sms' => rand(0, 10),
            'notes' => "Sample report for {$date}",
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        $employeeReports++;
        $totalReports++;
    }
    
    echo "✅ Created {$employeeReports} reports for {$employee->user->name}\n";
}

echo "\n🎉 Successfully created {$totalReports} work reports!\n";

// Show summary stats
$stats = WorkReport::selectRaw('
    COUNT(*) as total_reports,
    COUNT(DISTINCT employee_id) as employees_with_reports,
    COUNT(DISTINCT date) as unique_dates,
    SUM(calls) as total_calls,
    SUM(successful_calls) as total_successful,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
')->first();

echo "\n📈 SUMMARY STATISTICS:\n";
echo str_repeat("=", 40) . "\n";
echo "Total Reports: {$stats->total_reports}\n";
echo "Employees with Reports: {$stats->employees_with_reports}\n";
echo "Unique Dates: {$stats->unique_dates}\n";
echo "Total Calls: {$stats->total_calls}\n";
echo "Total Successful: {$stats->total_successful}\n";
echo "Date Range: {$stats->earliest_date} to {$stats->latest_date}\n";

echo "\n✅ Sample data created! Now test the date filtering in /work-reports\n";