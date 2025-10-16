<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use Spatie\Permission\Models\Role;

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Assigning Default Roles ===\n\n";

// Get users who have employee records but no roles
$usersWithoutRoles = User::whereHas('employee')
    ->whereDoesntHave('roles')
    ->with('employee')
    ->get();

echo "Found {$usersWithoutRoles->count()} users with employee records but no roles.\n\n";

$assignedCount = 0;
foreach ($usersWithoutRoles as $user) {
    $user->assignRole('Employee');
    $assignedCount++;
    
    if ($assignedCount <= 10) { // Show first 10 for brevity
        echo "✓ Assigned Employee role to: {$user->name} ({$user->email})\n";
    } elseif ($assignedCount == 11) {
        echo "... (continuing to assign roles to remaining users)\n";
    }
}

echo "\n=== Summary ===\n";
echo "Assigned Employee role to {$assignedCount} users.\n";

// Final count
$totalWithRoles = User::whereHas('roles')->count();
$totalWithoutRoles = User::whereDoesntHave('roles')->count();

echo "Users with roles: {$totalWithRoles}\n";
echo "Users without roles: {$totalWithoutRoles}\n";

echo "\n=== Complete ===\n";