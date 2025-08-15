<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\WorkReport;

echo "=== Work Reports Authorization Debug ===\n\n";

// Check users and their roles
$users = User::with(['roles', 'employee'])->get();
echo "Users in system:\n";
foreach ($users as $user) {
    echo "- User: {$user->email}\n";
    echo "  Roles: " . $user->roles->pluck('name')->implode(', ') . "\n";
    echo "  Has Employee: " . ($user->employee ? "Yes (ID: {$user->employee->id})" : "No") . "\n";
    
    // Test authorization
    echo "  Can viewAny WorkReport: " . ($user->can('viewAny', WorkReport::class) ? "Yes" : "No") . "\n";
    echo "  Can create WorkReport: " . ($user->can('create', WorkReport::class) ? "Yes" : "No") . "\n";
    echo "\n";
}

// Check employees
echo "Employees in system: " . Employee::count() . "\n";
$employees = Employee::with('user')->get();
foreach ($employees as $employee) {
    echo "- Employee ID: {$employee->id}, User: " . ($employee->user ? $employee->user->email : "No user") . "\n";
}

echo "\nWork Reports count: " . WorkReport::count() . "\n";