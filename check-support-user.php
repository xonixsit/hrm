<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== Checking support@xonixs.com user ===\n\n";

$user = User::where('email', 'support@xonixs.com')->first();

if ($user) {
    echo "✓ User exists\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Created: {$user->created_at}\n";
    
    $roles = $user->roles->pluck('name')->toArray();
    if (empty($roles)) {
        echo "Roles: None assigned\n";
    } else {
        echo "Roles: " . implode(', ', $roles) . "\n";
    }
    
    echo "Has Admin role: " . ($user->hasRole('Admin') ? 'Yes' : 'No') . "\n";
    echo "Has any role: " . ($user->roles->count() > 0 ? 'Yes' : 'No') . "\n";
} else {
    echo "✗ User does not exist in the database\n";
    echo "You need to create this user first or run the seeder\n";
}

echo "\n=== Check Complete ===\n";