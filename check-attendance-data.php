<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking attendance data...\n\n";

// Check total attendance records
$totalAttendances = DB::table('attendances')->count();
echo "Total attendance records: {$totalAttendances}\n";

if ($totalAttendances > 0) {
    // Check attendance records structure
    $sampleAttendance = DB::table('attendances')->first();
    echo "Sample attendance record:\n";
    print_r($sampleAttendance);
    
    // Check current month attendances
    $currentMonth = now()->format('Y-m');
    echo "\nCurrent month: {$currentMonth}\n";
    
    $currentMonthAttendances = DB::table('attendances')
        ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$currentMonth])
        ->count();
    echo "Current month attendances: {$currentMonthAttendances}\n";
    
    // Check by employee
    $attendancesByEmployee = DB::table('attendances')
        ->select('employee_id', DB::raw('count(*) as count'))
        ->groupBy('employee_id')
        ->get();
    
    echo "\nAttendances by employee:\n";
    foreach ($attendancesByEmployee as $attendance) {
        echo "- Employee {$attendance->employee_id}: {$attendance->count} records\n";
    }
    
    // Check working days calculation
    $workingDaysInMonth = now()->daysInMonth - (now()->weekendsInMonth * 2);
    echo "\nWorking days in current month: {$workingDaysInMonth}\n";
    echo "Total days in month: " . now()->daysInMonth . "\n";
    echo "Weekends in month: " . now()->weekendsInMonth . "\n";
    
} else {
    echo "No attendance records found in the database.\n";
    
    // Check if there are any employees
    $totalEmployees = DB::table('employees')->count();
    echo "Total employees: {$totalEmployees}\n";
    
    // Check if there are any users
    $totalUsers = DB::table('users')->count();
    echo "Total users: {$totalUsers}\n";
}