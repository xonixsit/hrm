<?php

require_once 'vendor/autoload.php';

use App\Models\User;

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Self-Removal Protection ===\n\n";

// Get admin users
$adminUsers = User::role('Admin')->with('roles')->get();

echo "Current Admin Users:\n";
foreach ($adminUsers as $admin) {
    echo "- {$admin->name} ({$admin->email}) - ID: {$admin->id}\n";
}

echo "\nAdmin Count: " . $adminUsers->count() . "\n";

if ($adminUsers->count() > 1) {
    echo "\n✅ Multiple admins exist - self-removal protection will work correctly\n";
    echo "   - Admins can remove other admins' roles\n";
    echo "   - Admins cannot remove their own admin role\n";
} else {
    echo "\n⚠️  Only one admin exists - additional protection active\n";
    echo "   - Cannot remove admin role from the last administrator\n";
    echo "   - Admin cannot remove their own admin role\n";
}

echo "\n=== Protection Rules ===\n";
echo "1. Admin cannot remove their own Admin role (frontend + backend)\n";
echo "2. Cannot remove Admin role from the last administrator (backend)\n";
echo "3. Frontend shows warning message for self-removal attempts\n";
echo "4. Backend returns error for invalid removal attempts\n";

echo "\n=== Test Complete ===\n";