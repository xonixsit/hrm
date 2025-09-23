<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\WorkReport;
use App\Models\Employee;

echo "=== WORK REPORTS SAMPLE DATA ===\n\n";

// Get top 10 performers for leaderboard
$topPerformers = Employee::with('user')
    ->whereHas('user')
    ->get()
    ->map(function ($employee) {
        $stats = WorkReport::where('employee_id', $employee->id)
            ->selectRaw('
                SUM(calls) as total_calls,
                SUM(successful_calls) as successful_calls,
                SUM(emails) as emails,
                SUM(whatsapp) as whatsapp,
                SUM(sms) as sms,
                COUNT(DISTINCT date) as total_days
            ')->first();
        
        $totalCalls = $stats->total_calls ?? 0;
        $successfulCalls = $stats->successful_calls ?? 0;
        $successRate = $totalCalls > 0 ? round(($successfulCalls / $totalCalls) * 100, 1) : 0;
        
        // Calculate performance score
        $performanceScore = 0;
        if ($totalCalls > 0) {
            $performanceScore = ($successRate * 0.4) + (($totalCalls / 100) * 30) + 
                              ((($stats->emails + $stats->whatsapp + $stats->sms) / max($totalCalls, 1)) * 20) +
                              (($stats->total_days / 30) * 10);
        }
        
        return [
            'name' => $employee->user->name,
            'employee_code' => $employee->employee_code,
            'total_calls' => (int) $totalCalls,
            'successful_calls' => (int) $successfulCalls,
            'success_rate' => $successRate,
            'emails' => (int) ($stats->emails ?? 0),
            'whatsapp' => (int) ($stats->whatsapp ?? 0),
            'sms' => (int) ($stats->sms ?? 0),
            'total_days' => (int) ($stats->total_days ?? 0),
            'performance_score' => round($performanceScore, 0)
        ];
    })
    ->sortByDesc('performance_score')
    ->take(10)
    ->values();

echo "🏆 TOP 10 PERFORMERS (Leaderboard Preview):\n";
echo str_repeat("=", 80) . "\n";
printf("%-4s %-25s %-8s %-8s %-8s %-8s %-8s\n", 
    "Rank", "Name", "Calls", "Success", "Rate%", "Emails", "Score");
echo str_repeat("-", 80) . "\n";

foreach ($topPerformers as $index => $performer) {
    $rank = $index + 1;
    $medal = $rank <= 3 ? ['🥇', '🥈', '🥉'][$rank - 1] : "#{$rank}";
    
    printf("%-4s %-25s %-8d %-8d %-8.1f %-8d %-8d\n",
        $medal,
        substr($performer['name'], 0, 24),
        $performer['total_calls'],
        $performer['successful_calls'],
        $performer['success_rate'],
        $performer['emails'],
        $performer['performance_score']
    );
}

echo "\n";

// Show some recent activity
$recentReports = WorkReport::with('employee.user')
    ->orderBy('date', 'desc')
    ->take(5)
    ->get();

echo "📊 RECENT ACTIVITY (Last 5 Reports):\n";
echo str_repeat("=", 80) . "\n";
printf("%-12s %-25s %-8s %-8s %-8s\n", "Date", "Employee", "Calls", "Success", "Rate%");
echo str_repeat("-", 80) . "\n";

foreach ($recentReports as $report) {
    $successRate = $report->calls > 0 ? round(($report->successful_calls / $report->calls) * 100, 1) : 0;
    
    printf("%-12s %-25s %-8d %-8d %-8.1f\n",
        $report->date,
        substr($report->employee->user->name ?? 'Unknown', 0, 24),
        $report->calls,
        $report->successful_calls,
        $successRate
    );
}

echo "\n";

// Overall stats
$totalStats = WorkReport::selectRaw('
    COUNT(*) as total_reports,
    COUNT(DISTINCT employee_id) as active_employees,
    SUM(calls) as total_calls,
    SUM(successful_calls) as total_successful,
    AVG(calls) as avg_calls_per_report,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
')->first();

$overallSuccessRate = $totalStats->total_calls > 0 ? 
    round(($totalStats->total_successful / $totalStats->total_calls) * 100, 1) : 0;

echo "📈 OVERALL SYSTEM STATS:\n";
echo str_repeat("=", 50) . "\n";
echo "Total Reports: " . number_format($totalStats->total_reports) . "\n";
echo "Active Employees: " . $totalStats->active_employees . "\n";
echo "Total Calls: " . number_format($totalStats->total_calls) . "\n";
echo "Overall Success Rate: {$overallSuccessRate}%\n";
echo "Avg Calls per Report: " . round($totalStats->avg_calls_per_report, 1) . "\n";
echo "Date Range: {$totalStats->earliest_date} to {$totalStats->latest_date}\n";

echo "\n✅ Sample data is ready! Visit /work-reports to see the UX in action.\n";