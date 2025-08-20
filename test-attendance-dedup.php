<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Attendance Deduplication ===\n\n";

// Test the actual query logic from the controller
$query = \App\Models\Attendance::with('employee.user');

// Apply the same deduplication logic
$dedupQuery = \App\Models\Attendance::select('attendances.*')
    ->whereIn('id', function($subQuery) {
        $subQuery->selectRaw('MAX(id)')
                 ->from('attendances')
                 ->whereNotNull('employee_id')
                 ->whereNotNull('date')
                 ->groupBy('employee_id', 'date');
    })
    ->orderBy('date', 'desc');

$results = $dedupQuery->get();

echo "Total records after deduplication: " . $results->count() . "\n";
echo "Total original records: " . \App\Models\Attendance::count() . "\n\n";

// Check Alex John's records
$alexRecords = $results->filter(function($att) {
    return $att->employee && $att->employee->user && $att->employee->user->name === 'Alex John';
});

echo "Alex John records after deduplication: " . $alexRecords->count() . "\n";

$alexAug11 = $alexRecords->filter(function($att) {
    return $att->date === '2025-08-11';
});

echo "Alex John records on 2025-08-11 after deduplication: " . $alexAug11->count() . "\n";

if ($alexAug11->count() > 1) {
    echo "❌ Deduplication is NOT working! Found duplicates:\n";
    foreach ($alexAug11 as $record) {
        echo "  ID: {$record->id} - Date: {$record->date} - Clock In: {$record->clock_in}\n";
    }
} else {
    echo "✅ Deduplication is working correctly!\n";
    if ($alexAug11->count() === 1) {
        echo "Latest record for Alex John on 2025-08-11: ID {$alexAug11->first()->id}\n";
    }
}

// Show all Alex John records for comparison
$allAlex = \App\Models\Attendance::whereHas('employee.user', function($q) {
    $q->where('name', 'Alex John');
})->get();

echo "\nAll Alex John records (before deduplication): " . $allAlex->count() . "\n";
foreach ($allAlex as $record) {
    echo "  ID: {$record->id} - Date: {$record->date} - Clock In: {$record->clock_in}\n";
}