<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== URL PARAMETER DEBUGGING ===\n\n";

echo "Common URL parameters that might hide assessments:\n";
echo "1. ?status=draft (would hide submitted assessments)\n";
echo "2. ?status=approved (would hide draft/submitted assessments)\n";
echo "3. ?assessment_cycle_id=1 (would hide assessments without cycle)\n";
echo "4. ?assessment_cycle_id=999 (would hide all assessments if cycle doesn't exist)\n\n";

echo "To fix this issue, try accessing:\n";
echo "https://hrm.xonixs.com/my-assessments (with no parameters)\n\n";

echo "Or click 'Clear Filters' button on the page.\n\n";

// Check what assessment cycles exist
echo "Available Assessment Cycles:\n";
$cycles = \App\Models\AssessmentCycle::all();
foreach ($cycles as $cycle) {
    echo "ID: {$cycle->id}, Name: {$cycle->name}, Active: " . ($cycle->is_active ? 'Yes' : 'No') . "\n";
}

echo "\n=== DONE ===\n";