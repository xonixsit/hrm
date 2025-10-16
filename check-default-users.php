<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Checking Default Seeded Users ===\n\n";

$defaultEmails = ['admin@example.com', 'support@xonixs.com', 'hr@example.com', 'manager@example.com', 'employee@example.com'];

foreach ($defaultEmails as $email) {
    $user = App\Models\User::where('email', $email)->with('roles')->first();
    if ($user) {
        $roles = $user->roles->pluck('name')->toArray();
        echo "✓ {$email} - Roles: " . (empty($roles) ? 'None' : implode(', ', $roles)) . "\n";
    } else {
        echo "✗ {$email} - User not found\n";
    }
}

echo "\n=== Summary ===\n";
echo "Total users: " . App\Models\User::count() . "\n";
echo "Users with roles: " . App\Models\User::whereHas('roles')->count() . "\n";
echo "Users without roles: " . App\Models\User::whereDoesntHave('roles')->count() . "\n";