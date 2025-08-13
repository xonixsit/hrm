<?php

// Fix attendance status inconsistency
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Attendance;

echo "🔧 Fixing attendance status inconsistency...\n";

// Find the attendance record
$attendance = Attendance::find(106);

if (!$attendance) {
    echo "❌ Attendance record #106 not found\n";
    exit(1);
}

echo "📊 Current record:\n";
echo "   - ID: {$attendance->id}\n";
echo "   - Status: {$attendance->status}\n";
echo "   - Clock In: " . ($attendance->clock_in ? $attendance->clock_in->format('Y-m-d H:i:s') : 'NULL') . "\n";
echo "   - Clock Out: " . ($attendance->clock_out ? $attendance->clock_out->format('Y-m-d H:i:s') : 'NULL') . "\n";
echo "   - isClockedIn(): " . ($attendance->isClockedIn() ? 'true' : 'false') . "\n\n";

// Check if status needs fixing
if ($attendance->clock_in && !$attendance->clock_out && $attendance->status === 'clocked_out') {
    echo "🔧 Fixing inconsistent status...\n";
    
    $attendance->status = 'clocked_in';
    $attendance->save();
    
    echo "✅ Status updated to 'clocked_in'\n";
    echo "✅ isClockedIn() now returns: " . ($attendance->isClockedIn() ? 'true' : 'false') . "\n\n";
    
    echo "🎯 Now refresh the dashboard - the timer should appear!\n";
} else {
    echo "ℹ️ Status is already correct or record is properly clocked out\n";
}

echo "\n✅ Fix completed!\n";