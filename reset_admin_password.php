<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Looking for admin user with email: xonixsitsolutions@gmail.com\n";

$user = User::where('email', 'xonixsitsolutions@gmail.com')->first();

if ($user) {
    echo "Found user: {$user->name} (ID: {$user->id})\n";
    
    // Reset password to 'admin123'
    $user->password = Hash::make('admin123');
    $user->save();
    
    echo "✅ Password reset successfully!\n";
    echo "Email: {$user->email}\n";
    echo "New Password: admin123\n";
    echo "Please change this password after logging in.\n";
} else {
    echo "❌ User not found with email: xonixsitsolutions@gmail.com\n";
    
    // Let's check what users exist
    echo "\nExisting users:\n";
    $users = User::all();
    foreach ($users as $u) {
        echo "- {$u->name} ({$u->email})\n";
    }
}