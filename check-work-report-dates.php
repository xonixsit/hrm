<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\WorkReport;

echo "=== WORK REPORTS DATE ANALYSIS ===\n\n";

// Check date distribution
$dateStats = WorkReport::selectRaw('
    date,
    COUNT(*) as report_count,
    SUM(calls) as total_calls,
    SUM(successful_calls) as successful_calls
')
->groupBy('date')
->orderBy('date', 'desc')
->limit(20)
->get();

echo "📅 DATE DISTRIBUTION (Last 20 dates):\n";
echo str_repeat("=", 60) . "\n";
printf("%-12s %-8s %-8s %-8s\n", "Date", "Reports", "Calls", "Success");
echo str_repeat("-", 60) . "\n";

foreach ($dateStats as $stat) {
    printf("%-12s %-8d %-8d %-8d\n",
        $stat->date,
        $stat->report_count,
        $stat->total_calls,
        $stat->successful_calls
    );
}

echo "\n";

// Check overall date range
$overallStats = WorkReport::selectRaw('
    MIN(date) as earliest_date,
    MAX(date) as latest_date,
    COUNT(DISTINCT date) as unique_dates,
    COUNT(*) as total_reports
')->first();

echo "📊 OVERALL DATE STATS:\n";
echo str_repeat("=", 40) . "\n";
echo "Earliest Date: {$overallStats->earliest_date}\n";
echo "Latest Date: {$overallStats->latest_date}\n";
echo "Unique Dates: {$overallStats->unique_dates}\n";
echo "Total Reports: {$overallStats->total_reports}\n";

// Test specific date ranges
echo "\n🔍 TESTING DATE RANGE QUERIES:\n";
echo str_repeat("=", 50) . "\n";

// Test this week
$thisWeekStart = now()->startOfWeek()->format('Y-m-d');
$thisWeekEnd = now()->endOfWeek()->format('Y-m-d');
$thisWeekCount = WorkReport::whereBetween('date', [$thisWeekStart, $thisWeekEnd])->count();
echo "This Week ({$thisWeekStart} to {$thisWeekEnd}): {$thisWeekCount} reports\n";

// Test this month
$thisMonthStart = now()->startOfMonth()->format('Y-m-d');
$thisMonthEnd = now()->endOfMonth()->format('Y-m-d');
$thisMonthCount = WorkReport::whereBetween('date', [$thisMonthStart, $thisMonthEnd])->count();
echo "This Month ({$thisMonthStart} to {$thisMonthEnd}): {$thisMonthCount} reports\n";

// Test this year
$thisYearStart = now()->startOfYear()->format('Y-m-d');
$thisYearEnd = now()->endOfYear()->format('Y-m-d');
$thisYearCount = WorkReport::whereBetween('date', [$thisYearStart, $thisYearEnd])->count();
echo "This Year ({$thisYearStart} to {$thisYearEnd}): {$thisYearCount} reports\n";

echo "\n✅ Date analysis complete!\n";