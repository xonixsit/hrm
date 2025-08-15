<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Leave;
use Illuminate\Support\Facades\Auth;

echo "=== Leave Approval Debug ===\n\n";

// Check if we have a logged in user (we'll check the first admin user)
$adminUser = User::whereHas('roles', function($query) {
    $query->whereIn('name', ['Admin', 'HR', 'Manager']);
})->first();

if ($adminUser) {
    echo "Found approver user: {$adminUser->email}\n";
    echo "User roles: " . $adminUser->roles->pluck('name')->implode(', ') . "\n";
} else {
    echo "No approver users found\n";
}

// Check leave ID 54
$leave = Leave::find(54);
if ($leave) {
    echo "\nLeave ID 54 details:\n";
    echo "- Status: {$leave->status}\n";
    echo "- Employee: " . ($leave->employee ? $leave->employee->user->name : 'No employee') . "\n";
    echo "- From Date: {$leave->from_date}\n";
    echo "- To Date: {$leave->to_date}\n";
    echo "- Leave Type: " . ($leave->leaveType ? $leave->leaveType->name : 'No type') . "\n";
    echo "- Approved By: " . ($leave->approved_by ? $leave->approved_by : 'None') . "\n";
} else {
    echo "\nLeave ID 54 not found\n";
}

// Check all users and their roles
echo "\n=== All Users and Roles ===\n";
$users = User::with('roles')->get();
foreach ($users as $user) {
    echo "- {$user->email}: " . $user->roles->pluck('name')->implode(', ') . "\n";
}

echo "\n=== Debug Complete ===\n";