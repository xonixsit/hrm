<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use Spatie\Permission\Models\Role;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Role Management System Test ===\n\n";

// Check if roles exist
echo "Available Roles:\n";
$roles = Role::all();
foreach ($roles as $role) {
    echo "- {$role->name}\n";
}

echo "\nUsers and their roles:\n";
$users = User::with(['roles', 'employee'])->get();

foreach ($users as $user) {
    $userRoles = $user->roles->pluck('name')->toArray();
    $employeeCode = $user->employee->employee_code ?? 'N/A';
    
    echo "- {$user->name} ({$user->email}) [ID: {$employeeCode}]\n";
    if (empty($userRoles)) {
        echo "  Roles: None assigned\n";
    } else {
        echo "  Roles: " . implode(', ', $userRoles) . "\n";
    }
    echo "\n";
}

// Test role assignment
echo "Testing role assignment...\n";
$testUser = User::where('email', 'employee@example.com')->first();
if ($testUser) {
    echo "Current roles for {$testUser->name}: " . implode(', ', $testUser->roles->pluck('name')->toArray()) . "\n";
    
    // Test assigning Manager role
    if (!$testUser->hasRole('Manager')) {
        $testUser->assignRole('Manager');
        echo "✓ Assigned Manager role to {$testUser->name}\n";
    } else {
        echo "✓ {$testUser->name} already has Manager role\n";
    }
    
    // Refresh and check
    $testUser->refresh();
    echo "Updated roles: " . implode(', ', $testUser->roles->pluck('name')->toArray()) . "\n";
}

echo "\n=== Test Complete ===\n";