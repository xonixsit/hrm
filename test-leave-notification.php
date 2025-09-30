<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Leave;
use App\Notifications\LeaveAppliedNotification;
use App\Notifications\LeaveApplicationConfirmationNotification;

echo "Testing Leave Notification System...\n\n";

try {
    // Get a test leave record
    $leave = Leave::with(['employee.user', 'leaveType'])->first();
    
    if (!$leave) {
        echo "❌ No leave records found in database. Please create a leave first.\n";
        exit(1);
    }
    
    echo "✓ Found leave record ID: {$leave->id}\n";
    echo "  Employee: " . ($leave->employee->user->name ?? 'Unknown') . "\n";
    echo "  Leave Type: " . ($leave->leaveType->name ?? 'Unknown') . "\n";
    echo "  Dates: {$leave->from_date->format('M d, Y')} to {$leave->to_date->format('M d, Y')}\n\n";
    
    // Test employee notification
    echo "Testing employee confirmation notification...\n";
    try {
        $leave->employee->user->notify(new LeaveApplicationConfirmationNotification($leave));
        echo "✓ Employee notification sent successfully\n\n";
    } catch (Exception $e) {
        echo "❌ Employee notification failed: " . $e->getMessage() . "\n\n";
    }
    
    // Test admin notification
    echo "Testing admin notification...\n";
    $admins = User::whereHas('roles', function ($query) {
        $query->whereIn('name', ['Admin', 'HR']);
    })->get();
    
    if ($admins->isEmpty()) {
        echo "⚠ No admin/HR users found\n";
    } else {
        echo "Found " . $admins->count() . " admin/HR user(s)\n";
        foreach ($admins as $admin) {
            try {
                $admin->notify(new LeaveAppliedNotification($leave));
                echo "✓ Notification sent to: {$admin->name} ({$admin->email})\n";
            } catch (Exception $e) {
                echo "❌ Failed to send to {$admin->name}: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n✓ Test completed!\n";
    echo "\nCheck your email inbox for the notifications.\n";
    echo "If using SMTP, check the mail logs at: storage/logs/laravel.log\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}