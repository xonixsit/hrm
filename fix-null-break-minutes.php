<?php

// Fix null total_break_minutes in existing attendance records
// Run this script once to fix any existing null values

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Attendance;

echo "🔧 Fixing null total_break_minutes in attendance records...\n";
echo "========================================================\n\n";

// Find all attendance records where total_break_minutes is null
$nullRecords = Attendance::whereNull('total_break_minutes')->get();

echo "Found {$nullRecords->count()} records with null total_break_minutes\n\n";

if ($nullRecords->isEmpty()) {
    echo "✅ No records need fixing!\n";
    exit;
}

$fixed = 0;

foreach ($nullRecords as $attendance) {
    echo "Fixing attendance ID {$attendance->id}...\n";
    
    // Calculate expected break minutes from break_sessions
    $expectedBreakMinutes = 0;
    if ($attendance->break_sessions && is_array($attendance->break_sessions)) {
        foreach ($attendance->break_sessions as $session) {
            if (isset($session['duration_minutes'])) {
                $expectedBreakMinutes += $session['duration_minutes'];
            }
        }
    }
    
    // Update the record
    $attendance->update(['total_break_minutes' => $expectedBreakMinutes]);
    
    echo "  - Set total_break_minutes to {$expectedBreakMinutes} minutes\n";
    echo "  - Break duration now shows: {$attendance->break_duration}\n\n";
    
    $fixed++;
}

echo "✅ Fixed {$fixed} attendance records\n";
echo "Break time should now display correctly in the frontend!\n";

?>