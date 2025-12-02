<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Employee;
use App\Models\Attendance;

echo "Checking attendance status for today (" . today()->format('Y-m-d') . "):\n\n";

$employees = Employee::active()
    ->whereHas('user', function($query) {
        $query->whereHas('roles', function($roleQuery) {
            $roleQuery->where('name', 'Employee');
        });
    })
    ->with(['user', 'attendances' => function($query) {
        $query->whereDate('date', today());
    }])
    ->get();

echo "Total active employees with Employee role: " . $employees->count() . "\n\n";

foreach ($employees as $employee) {
    $todayAttendance = $employee->attendances->first();
    $status = $todayAttendance ? 'HAS CLOCKED IN' : 'NOT CLOCKED IN';
    echo "- {$employee->user->name}: {$status}\n";
    
    if ($todayAttendance) {
        echo "  Clock In: {$todayAttendance->clock_in}\n";
        echo "  Clock Out: " . ($todayAttendance->clock_out ?? 'Still working') . "\n";
    }
    echo "\n";
}

// Now check who should receive reminders (those who haven't clocked in)
$employeesWithoutClockIn = Employee::active()
    ->whereHas('user', function($query) {
        $query->whereHas('roles', function($roleQuery) {
            $roleQuery->where('name', 'Employee');
        });
    })
    ->whereDoesntHave('attendances', function($query) {
        $query->whereDate('date', today());
    })
    ->with('user')
    ->get();

echo "Employees who should receive reminders (no attendance today): " . $employeesWithoutClockIn->count() . "\n";
foreach ($employeesWithoutClockIn as $employee) {
    echo "- {$employee->user->name}\n";
}