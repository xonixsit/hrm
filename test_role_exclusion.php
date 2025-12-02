<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Employee;
use App\Models\User;

echo "Testing role exclusion for clock-in reminders:\n\n";

// Get all active employees
$allEmployees = Employee::active()->with(['user'])->get();
echo "Total active employees: " . $allEmployees->count() . "\n";

foreach ($allEmployees as $employee) {
    if ($employee->user) {
        $roles = $employee->user->getRoleNames()->toArray();
        echo "- {$employee->user->name}: " . implode(', ', $roles) . "\n";
    }
}

echo "\n" . str_repeat("-", 50) . "\n";

// Get employees who should receive reminders (Employee role only, exclude Admin/HR/Manager)
$reminderEmployees = Employee::active()
    ->whereHas('user', function($query) {
        $query->whereHas('roles', function($roleQuery) {
            $roleQuery->where('name', 'Employee');
        })
        ->whereDoesntHave('roles', function($roleQuery) {
            $roleQuery->whereIn('name', ['Admin', 'HR', 'Manager']);
        });
    })
    ->with(['user'])
    ->get();

echo "Employees who should receive clock-in reminders: " . $reminderEmployees->count() . "\n";

foreach ($reminderEmployees as $employee) {
    if ($employee->user) {
        $roles = $employee->user->getRoleNames()->toArray();
        echo "- {$employee->user->name}: " . implode(', ', $roles) . "\n";
    }
}

echo "\n" . str_repeat("-", 50) . "\n";

// Get employees who should be excluded
$excludedEmployees = Employee::active()
    ->whereHas('user', function($query) {
        $query->whereHas('roles', function($roleQuery) {
            $roleQuery->whereIn('name', ['Admin', 'HR', 'Manager']);
        });
    })
    ->with(['user'])
    ->get();

echo "Employees excluded from reminders (Admin/HR/Manager): " . $excludedEmployees->count() . "\n";

foreach ($excludedEmployees as $employee) {
    if ($employee->user) {
        $roles = $employee->user->getRoleNames()->toArray();
        echo "- {$employee->user->name}: " . implode(', ', $roles) . "\n";
    }
}