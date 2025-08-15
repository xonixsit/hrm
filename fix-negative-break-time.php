<?php

// Fix negative break time values caused by the diffInMinutes bug
// Run this script to clean up corrupted break time data

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Attendance;
use Carbon\Carbon;

echo "🔧 Fixing negative break time values...\n";
echo "=====================================\n\n";

// Find all attendance records with negative total_break_minutes
$negativeRecords = Attendance::where('total_break_minutes', '<', 0)->get();

echo "Found {$negativeRecords->count()} records with negative break time\n\n";

if ($negativeRecords->isEmpty()) {
    echo "✅ No negative break time records found!\n";
} else {
    $fixed = 0;
    
    foreach ($negativeRecords as $attendance) {
        echo "Fixing attendance ID {$attendance->id}...\n";
        echo "  - Current total_break_minutes: {$attendance->total_break_minutes}\n";
        
        // Recalculate break time from break_sessions
        $correctBreakMinutes = 0;
        $fixedSessions = [];
        
        if ($attendance->break_sessions && is_array($attendance->break_sessions)) {
            foreach ($attendance->break_sessions as $session) {
                if (isset($session['start']) && isset($session['end'])) {
                    $start = Carbon::parse($session['start']);
                    $end = Carbon::parse($session['end']);
                    
                    // Calculate correct duration (positive)
                    $correctDuration = $start->diffInMinutes($end);
                    $correctBreakMinutes += $correctDuration;
                    
                    // Fix the session data
                    $fixedSessions[] = [
                        'start' => $session['start'],
                        'end' => $session['end'],
                        'duration_minutes' => $correctDuration
                    ];
                    
                    echo "    - Session: {$correctDuration} minutes (was: " . ($session['duration_minutes'] ?? 'unknown') . ")\n";
                }
            }
        }
        
        // Update the record with correct values
        $attendance->update([
            'total_break_minutes' => $correctBreakMinutes,
            'break_sessions' => $fixedSessions
        ]);
        
        echo "  - Fixed total_break_minutes: {$correctBreakMinutes}\n";
        echo "  - New break_duration: {$attendance->break_duration}\n\n";
        
        $fixed++;
    }
    
    echo "✅ Fixed {$fixed} records with negative break time\n";
}

// Also check for any records that are currently on break with negative current break
echo "\n🔍 Checking current break sessions...\n";
$currentBreakRecords = Attendance::where('on_break', true)->get();

foreach ($currentBreakRecords as $attendance) {
    if ($attendance->current_break_start) {
        $currentBreakMinutes = $attendance->current_break_start->diffInMinutes(now());
        echo "Attendance ID {$attendance->id}: Current break duration = {$currentBreakMinutes} minutes\n";
        
        if ($currentBreakMinutes < 0) {
            echo "  🚨 WARNING: Current break has negative duration!\n";
            echo "  - Break started: {$attendance->current_break_start}\n";
            echo "  - Current time: " . now() . "\n";
            echo "  - This break session may need to be ended and restarted\n";
        }
    }
}

echo "\n🎯 SUMMARY:\n";
echo "Break time calculation bug has been fixed in the code.\n";
echo "Existing negative break time data has been corrected.\n";
echo "New break sessions should now calculate positive durations correctly.\n";

echo "\n💡 NEXT STEPS:\n";
echo "1. Refresh your browser\n";
echo "2. If currently on break, end the break and start a new one\n";
echo "3. Break time should now display correctly\n";

?>