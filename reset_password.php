<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

// Get email and password from command line arguments
if ($argc < 3) {
    echo "Usage: php reset_password.php <email> <new_password>\n";
    echo "Example: php reset_password.php support@xonixs.com newpassword123\n";
    exit(1);
}

$email = $argv[1];
$password = $argv[2];

// Find or create user
$user = User::where('email', $email)->first();

if (!$user) {
    echo "User with email {$email} not found. Creating new user...\n";
    
    // Extract name from email or use default
    $name = explode('@', $email)[0];
    $name = ucfirst(str_replace(['.', '_', '-'], ' ', $name));
    
    $user = User::create([
        'name' => $name,
        'email' => $email,
        'password' => Hash::make($password),
        'email_verified_at' => now(),
    ]);

    // Assign Admin role if it exists
    $adminRole = Role::where('name', 'Admin')->first();
    if ($adminRole) {
        $user->assignRole($adminRole);
        echo "Assigned Admin role to user.\n";
    }

    // Create employee record
    $employee = Employee::create([
        'user_id' => $user->id,
        'employee_code' => 'EMP' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
        'job_title' => 'System Administrator',
        'join_date' => now(),
        'status' => 'active',
        'contract_type' => 'full_time',
        'employment_type' => 'permanent',
    ]);

    echo "Created new user: {$user->name} ({$user->email})\n";
    echo "Created employee record with ID: {$employee->id}\n";
} else {
    echo "Found existing user: {$user->name} ({$user->email})\n";
    
    // Update password
    $user->update([
        'password' => Hash::make($password),
        'password_reset_required' => false,
    ]);
}

echo "Password reset successfully for {$user->email}\n";
echo "New password: {$password}\n";

// Show user's current roles
echo "\nCurrent roles for {$email}:\n";
foreach ($user->roles as $role) {
    echo "- {$role->name}\n";
}