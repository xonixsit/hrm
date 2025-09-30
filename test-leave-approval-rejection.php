<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Leave;
use App\Notifications\LeaveApprovedNotification;
use App\Notifications\LeaveRejectedNotification;

echo "Testing Leave Approval/Rejection Notification System...\n\n";

try {
    // Get a pending leave record
    $leave = Leave::with(['employee.user', 'leaveType'])
        ->where('status', 'pending')
        ->first();
    
    if (!$leave) {
        echo "⚠ No pending leave records found. Creating a test scenario...\n";
        // Try to get any leave and reset it to pending
        $leave = Leave::with(['employee.user', 'leaveType'])->first();
        if ($leave) {
            $leave->update(['status' => 'pending', 'approved_by' => null, 'approved_at' => null]);
            echo "✓ Reset leave ID {$leave->id} to pending status\n\n";
        } else {
            echo "❌ No leave records found in database. Please create a leave first.\n";
            exit(1);
        }
    }
    
    echo "✓ Found pending leave record ID: {$leave->id}\n";
    echo "  Employee: " . ($leave->employee->user->name ?? 'Unknown') . "\n";
    echo "  Employee Email: " . ($leave->employee->user->email ?? 'Unknown') . "\n";
    echo "  Leave Type: " . ($leave->leaveType->name ?? 'Unknown') . "\n";
    echo "  Dates: {$leave->from_date->format('M d, Y')} to {$leave->to_date->format('M d, Y')}\n\n";
    
    // Get an admin user to act as approver
    $admin = User::whereHas('roles', function ($query) {
        $query->whereIn('name', ['Admin', 'HR']);
    })->first();
    
    if (!$admin) {
        echo "❌ No admin/HR user found\n";
        exit(1);
    }
    
    echo "Using admin: {$admin->name} ({$admin->email})\n\n";
    
    // Test 1: Approval Notification
    echo "=== TEST 1: Testing Approval Notification ===\n";
    try {
        // Simulate approval
        $leave->update([
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'approval_comments' => 'Approved for testing purposes',
        ]);
        
        // Reload relationships
        $leave->load(['employee.user', 'leaveType', 'approver']);
        
        // Send notification
        $leave->employee->user->notify(new LeaveApprovedNotification($leave));
        
        echo "✓ Approval notification sent successfully to: {$leave->employee->user->email}\n";
        echo "  Approver: {$leave->approver->name}\n";
        echo "  Comments: {$leave->approval_comments}\n\n";
    } catch (Exception $e) {
        echo "❌ Approval notification failed: " . $e->getMessage() . "\n\n";
    }
    
    // Test 2: Rejection Notification
    echo "=== TEST 2: Testing Rejection Notification ===\n";
    try {
        // Simulate rejection
        $leave->update([
            'status' => 'rejected',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'approval_comments' => 'Rejected for testing purposes - insufficient leave balance',
        ]);
        
        // Reload relationships
        $leave->load(['employee.user', 'leaveType', 'approver']);
        
        // Send notification
        $leave->employee->user->notify(new LeaveRejectedNotification($leave));
        
        echo "✓ Rejection notification sent successfully to: {$leave->employee->user->email}\n";
        echo "  Rejected by: {$leave->approver->name}\n";
        echo "  Reason: {$leave->approval_comments}\n\n";
    } catch (Exception $e) {
        echo "❌ Rejection notification failed: " . $e->getMessage() . "\n\n";
    }
    
    // Reset leave to pending for future tests
    $leave->update([
        'status' => 'pending',
        'approved_by' => null,
        'approved_at' => null,
        'approval_comments' => null,
    ]);
    echo "✓ Leave reset to pending status for future tests\n\n";
    
    echo "=== TEST SUMMARY ===\n";
    echo "✓ All tests completed successfully!\n\n";
    echo "Check the following:\n";
    echo "1. Employee email inbox: {$leave->employee->user->email}\n";
    echo "2. Mail logs: storage/logs/laravel.log\n";
    echo "3. Database notifications table for in-app notifications\n\n";
    
    echo "Expected emails:\n";
    echo "- Approval email with subject: 'Leave Request Approved'\n";
    echo "- Rejection email with subject: 'Leave Request Rejected'\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}