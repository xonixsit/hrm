<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Attendance Duplicates Analysis ===\n\n";

// Check total records
echo "1. Total attendance records: " . \App\Models\Attendance::count() . "\n";

// Check unique combinations
echo "2. Unique employee-date combinations: " . \App\Models\Attendance::select('employee_id', 'date')->distinct()->count() . "\n\n";

// Find potential duplicates
$duplicates = \DB::table('attendances')
    ->select('employee_id', 'date', \DB::raw('COUNT(*) as count'))
    ->groupBy('employee_id', 'date')
    ->having('count', '>', 1)
    ->get();

if ($duplicates->isEmpty()) {
    echo "3. No duplicate employee-date combinations found.\n";
} else {
    echo "3. Found " . $duplicates->count() . " duplicate employee-date combinations:\n";
    foreach ($duplicates as $dup) {
        $employee = \App\Models\Employee::find($dup->employee_id);
        $name = $employee ? $employee->user->name : 'Unknown';
        echo "   - Employee: {$name} (ID: {$dup->employee_id}) - Date: {$dup->date} - Count: {$dup->count}\n";
    }
}

echo "\n4. Latest 10 attendance records:\n";
$latest = \App\Models\Attendance::with('employee.user')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

foreach ($latest as $record) {
    $name = $record->employee && $record->employee->user ? $record->employee->user->name : 'N/A';
    echo "   ID: {$record->id} - {$name} - {$record->date} - {$record->clock_in} - Status: {$record->status}\n";
}

echo "\n5. Records per employee (top 5):\n";
$employeeCounts = \DB::table('attendances')
    ->select('employee_id', \DB::raw('COUNT(*) as total'))
    ->groupBy('employee_id')
    ->orderBy('total', 'desc')
    ->limit(5)
    ->get();

foreach ($employeeCounts as $emp) {
    $employee = \App\Models\Employee::find($emp->employee_id);
    $name = $employee ? $employee->user->name : 'Unknown';
    echo "   {$name}: {$emp->total} records\n";
}

echo "\n=== Analysis Complete ===\n";