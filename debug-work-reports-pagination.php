<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\WorkReport;

echo "=== Debugging Work Reports Pagination ===\n\n";

$user = User::where('email', 'employee@example.com')->first();

if (!$user) {
    echo "❌ User not found\n";
    exit(1);
}

if (!$user->employee) {
    echo "❌ Employee record not found\n";
    exit(1);
}

echo "✅ User found: {$user->name}\n";
echo "✅ Employee ID: {$user->employee->id}\n\n";

// Check total work reports
$totalReports = WorkReport::where('employee_id', $user->employee->id)->count();
echo "📊 Total work reports in database: {$totalReports}\n\n";

if ($totalReports === 0) {
    echo "❌ No work reports found. Run create-sample-work-reports.php first.\n";
    exit(1);
}

// Test pagination
$workReports = WorkReport::where('employee_id', $user->employee->id)
    ->orderBy('date', 'desc')
    ->paginate(10);

echo "📄 Pagination Details:\n";
echo "   - Total: {$workReports->total()}\n";
echo "   - Current Page: {$workReports->currentPage()}\n";
echo "   - Per Page: {$workReports->perPage()}\n";
echo "   - Last Page: {$workReports->lastPage()}\n";
echo "   - From: {$workReports->firstItem()}\n";
echo "   - To: {$workReports->lastItem()}\n";
echo "   - Has Pages: " . ($workReports->hasPages() ? 'Yes' : 'No') . "\n";
echo "   - Data Count: {$workReports->count()}\n\n";

// Check the structure that would be sent to frontend
echo "🔍 Pagination Array Structure:\n";
$paginationArray = $workReports->toArray();
echo "   - data count: " . count($paginationArray['data']) . "\n";
echo "   - current_page: {$paginationArray['current_page']}\n";
echo "   - last_page: {$paginationArray['last_page']}\n";
echo "   - per_page: {$paginationArray['per_page']}\n";
echo "   - total: {$paginationArray['total']}\n";
echo "   - from: {$paginationArray['from']}\n";
echo "   - to: {$paginationArray['to']}\n\n";

// Show first few records
echo "📋 First 3 Records:\n";
foreach ($workReports->take(3) as $index => $report) {
    echo "   " . ($index + 1) . ". Date: {$report->date}, Calls: {$report->calls}, Follow-up: {$report->follow_up_calls}\n";
}

echo "\n✅ Pagination data looks correct!\n";
echo "The issue might be in the frontend component or data passing.\n";