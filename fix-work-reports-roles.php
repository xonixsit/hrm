<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Role;

echo "=== Fixing Work Reports Authorization ===\n\n";

// Check existing roles
echo "Existing roles:\n";
$roles = Role::all();
foreach ($roles as $role) {
    echo "- {$role->name}\n";
}

// Create missing roles if they don't exist
$requiredRoles = ['Employee', 'Manager', 'Admin', 'HR'];
foreach ($requiredRoles as $roleName) {
    if (!Role::where('name', $roleName)->exists()) {
        Role::create(['name' => $roleName]);
        echo "Created role: {$roleName}\n";
    }
}

// Assign Employee role to users who have employee records but no roles
$usersWithEmployeeButNoRoles = User::whereHas('employee')
    ->whereDoesntHave('roles')
    ->get();

echo "\nAssigning Employee role to users with employee records:\n";
foreach ($usersWithEmployeeButNoRoles as $user) {
    $user->assignRole('Employee');
    echo "- Assigned Employee role to: {$user->email}\n";
}

// Check for admin users and assign Admin role
$adminEmails = ['admin@example.com', 'support@xonixs.com'];
foreach ($adminEmails as $email) {
    $user = User::where('email', $email)->first();
    if ($user && !$user->hasRole('Admin')) {
        $user->assignRole('Admin');
        echo "- Assigned Admin role to: {$email}\n";
    }
}

// Check for HR users
$hrEmails = ['hr@example.com'];
foreach ($hrEmails as $email) {
    $user = User::where('email', $email)->first();
    if ($user && !$user->hasRole('HR')) {
        $user->assignRole('HR');
        echo "- Assigned HR role to: {$email}\n";
    }
}

// Check for Manager users
$managerEmails = ['manager@example.com'];
foreach ($managerEmails as $email) {
    $user = User::where('email', $email)->first();
    if ($user && !$user->hasRole('Manager')) {
        $user->assignRole('Manager');
        echo "- Assigned Manager role to: {$email}\n";
    }
}

echo "\n=== Fix Complete ===\n";
echo "Users can now access work reports if they have Employee, Manager, Admin, or HR roles.\n";