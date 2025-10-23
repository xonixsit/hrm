<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing dashboard fixes...\n\n";

// Get a user with assessments
$userWithAssessments = DB::table('competency_assessments')
    ->select('employee_id')
    ->where('status', 'submitted')
    ->first();

if (!$userWithAssessments) {
    echo "No users with submitted assessments found.\n";
    exit;
}

$employeeId = $userWithAssessments->employee_id;
echo "Testing for employee ID: {$employeeId}\n\n";

// Test Average Rating calculation
echo "=== Average Rating Test ===\n";
$myAverageRating = DB::table('competency_assessments')
    ->where('employee_id', $employeeId)
    ->where('status', 'submitted')
    ->whereNotNull('rating')
    ->avg('rating');

echo "Average rating for employee {$employeeId}: " . ($myAverageRating ? round($myAverageRating, 1) : 'null') . "\n\n";

// Test Attendance Rate calculation
echo "=== Attendance Rate Test ===\n";
$currentMonth = now()->format('Y-m');
echo "Current month: {$currentMonth}\n";

// Calculate working days in current month (excluding weekends)
$startOfMonth = now()->startOfMonth();
$endOfMonth = now()->endOfMonth();
$workingDays = 0;

for ($date = $startOfMonth->copy(); $date->lte($endOfMonth); $date->addDay()) {
    if (!$date->isWeekend()) {
        $workingDays++;
    }
}

echo "Working days in current month: {$workingDays}\n";

$attendedDays = DB::table('attendances')
    ->where('employee_id', $employeeId)
    ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$currentMonth])
    ->count();

echo "Attended days for employee {$employeeId}: {$attendedDays}\n";

$attendanceRate = $workingDays > 0 ? round(($attendedDays / $workingDays) * 100, 1) : 0;
echo "Attendance rate: {$attendanceRate}%\n\n";

// Check if there are any attendance records for this employee in any month
echo "=== All Attendance Records for Employee ===\n";
$allAttendances = DB::table('attendances')
    ->where('employee_id', $employeeId)
    ->select('date', 'status')
    ->orderBy('date', 'desc')
    ->get();

if ($allAttendances->count() > 0) {
    echo "Total attendance records for employee {$employeeId}: " . $allAttendances->count() . "\n";
    echo "Recent records:\n";
    foreach ($allAttendances->take(5) as $attendance) {
        echo "- {$attendance->date} ({$attendance->status})\n";
    }
} else {
    echo "No attendance records found for employee {$employeeId}\n";
}

// Test with a different month that has more data
echo "\n=== Testing with August 2025 (month with more data) ===\n";
$testMonth = '2025-08';
$testAttendedDays = DB::table('attendances')
    ->where('employee_id', $employeeId)
    ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$testMonth])
    ->count();

echo "Attended days in August 2025: {$testAttendedDays}\n";

// Calculate working days for August 2025
$augustStart = \Carbon\Carbon::parse('2025-08-01');
$augustEnd = \Carbon\Carbon::parse('2025-08-31');
$augustWorkingDays = 0;

for ($date = $augustStart->copy(); $date->lte($augustEnd); $date->addDay()) {
    if (!$date->isWeekend()) {
        $augustWorkingDays++;
    }
}

echo "Working days in August 2025: {$augustWorkingDays}\n";
$augustAttendanceRate = $augustWorkingDays > 0 ? round(($testAttendedDays / $augustWorkingDays) * 100, 1) : 0;
echo "August 2025 attendance rate: {$augustAttendanceRate}%\n";