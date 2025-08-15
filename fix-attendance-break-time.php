<?php

// Debug and fix attendance break time calculation
// Run this script to diagnose and fix the break time issue

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;

echo "🔍 Attendance Break Time Debug & Fix Script\n";
echo "==========================================\n\n";

// Get current user's attendance (you might need to adjust this)
$today = Carbon::today()->format('Y-m-d');

echo "1️⃣ Checking today's attendance records...\n";
$attendances = Attendance::whereDate('date', $today)->get();

if ($attendances->isEmpty()) {
    echo "❌ No attendance records found for today ($today)\n";
    echo "Please clock in first, then run this script.\n";
    exit;
}

foreach ($attendances as $attendance) {
    $employee = $attendance->employee;
    $user = $employee ? $employee->user : null;
    $userName = $user ? $user->name : 'Unknown';
    
    echo "\n📋 Attendance Record for: $userName\n";
    echo "- ID: {$attendance->id}\n";
    echo "- Date: {$attendance->date}\n";
    echo "- Clock In: {$attendance->clock_in}\n";
    echo "- Clock Out: " . ($attendance->clock_out ?? 'Still clocked in') . "\n";
    echo "- Status: {$attendance->status}\n";
    echo "- On Break: " . ($attendance->on_break ? 'Yes' : 'No') . "\n";
    
    // Check break-related fields
    echo "\n🔍 Break Time Analysis:\n";
    echo "- total_break_minutes (raw): " . var_export($attendance->total_break_minutes, true) . "\n";
    echo "- break_sessions (raw): " . var_export($attendance->break_sessions, true) . "\n";
    echo "- current_break_start: " . var_export($attendance->current_break_start, true) . "\n";
    
    // Test the break_duration attribute
    echo "- break_duration (calculated): {$attendance->break_duration}\n";
    
    // Check if total_break_minutes is null and fix it
    if ($attendance->total_break_minutes === null) {
        echo "🚨 ISSUE FOUND: total_break_minutes is NULL\n";
        echo "🔧 FIXING: Setting total_break_minutes to 0...\n";
        
        $attendance->update(['total_break_minutes' => 0]);
        echo "✅ Fixed: total_break_minutes set to 0\n";
    }
    
    // Calculate expected break time from break_sessions
    $expectedBreakMinutes = 0;
    if ($attendance->break_sessions && is_array($attendance->break_sessions)) {
        foreach ($attendance->break_sessions as $session) {
            if (isset($session['duration_minutes'])) {
                $expectedBreakMinutes += $session['duration_minutes'];
            }
        }
        
        echo "- Expected break minutes from sessions: $expectedBreakMinutes\n";
        echo "- Actual total_break_minutes: {$attendance->total_break_minutes}\n";
        
        // Fix mismatch
        if ($expectedBreakMinutes !== $attendance->total_break_minutes) {
            echo "🚨 MISMATCH FOUND: break_sessions total doesn't match total_break_minutes\n";
            echo "🔧 FIXING: Updating total_break_minutes to match break_sessions...\n";
            
            $attendance->update(['total_break_minutes' => $expectedBreakMinutes]);
            echo "✅ Fixed: total_break_minutes updated to $expectedBreakMinutes\n";
        }
    }
    
    // Test the calculation after fixes
    $attendance->refresh();
    echo "\n✅ After fixes:\n";
    echo "- total_break_minutes: {$attendance->total_break_minutes}\n";
    echo "- break_duration: {$attendance->break_duration}\n";
    
    // Test what the API would return
    echo "\n📡 API Response Test:\n";
    $todaysSummary = [
        'total_hours' => $attendance->work_duration ?? '0h 0m',
        'break_time' => $attendance->break_duration ?? '0h 0m',
        'sessions' => count($attendance->break_sessions ?? []) + 1,
        'clock_ins' => 1
    ];
    
    echo "- todays_summary.break_time: {$todaysSummary['break_time']}\n";
    
    if ($todaysSummary['break_time'] === '0h 0m' && !empty($attendance->break_sessions)) {
        echo "🚨 STILL BROKEN: break_time is 0h 0m but break_sessions exist\n";
        echo "🔍 Debug info:\n";
        echo "  - break_sessions count: " . count($attendance->break_sessions) . "\n";
        echo "  - total_break_minutes: {$attendance->total_break_minutes}\n";
        echo "  - on_break: " . ($attendance->on_break ? 'true' : 'false') . "\n";
        echo "  - current_break_start: " . ($attendance->current_break_start ?? 'null') . "\n";
        
        // Manual calculation
        $manualMinutes = $attendance->total_break_minutes ?? 0;
        if ($attendance->on_break && $attendance->current_break_start) {
            $manualMinutes += now()->diffInMinutes($attendance->current_break_start);
        }
        
        $manualHours = intval($manualMinutes / 60);
        $manualMins = $manualMinutes % 60;
        $manualResult = sprintf('%dh %dm', $manualHours, $manualMins);
        
        echo "  - Manual calculation result: $manualResult\n";
        
        if ($manualResult !== $attendance->break_duration) {
            echo "🚨 ATTRIBUTE CALCULATION BUG FOUND\n";
        }
    } else {
        echo "✅ Break time calculation appears to be working correctly\n";
    }
}

echo "\n🎯 SUMMARY:\n";
echo "If break_time is still showing as 0h 0m after running this script,\n";
echo "the issue is in the getBreakDurationAttribute() method calculation.\n";
echo "Check the Laravel logs and ensure the total_break_minutes field is being updated correctly.\n";

echo "\n💡 NEXT STEPS:\n";
echo "1. Refresh your browser and check if break time now displays correctly\n";
echo "2. Take a test break and verify it updates properly\n";
echo "3. If still broken, check Laravel logs for any database errors\n";

?>