<?php

// Simple test script to test assessment creation
// Run this with: php artisan tinker < test-assessment-creation.php

use App\Models\CompetencyAssessment;
use App\Models\Employee;
use App\Models\Competency;
use App\Models\User;

// Get test data
$employee = Employee::first();
$competency = Competency::first();
$user = User::first();

if (!$employee || !$competency || !$user) {
    echo "Missing test data. Please ensure you have employees, competencies, and users in the database.\n";
    exit;
}

echo "Testing assessment creation...\n";
echo "Employee: {$employee->id}\n";
echo "Competency: {$competency->id}\n";
echo "User: {$user->id}\n";

// Test data
$testData = [
    'employee_id' => $employee->id,
    'competency_id' => $competency->id,
    'assessor_id' => $user->id,
    'assessment_cycle_id' => null,
    'assessment_type' => 'manager',
    'status' => 'draft',
    'rating' => null,
    'comments' => null,
    'evidence_files' => [],
    'development_notes' => null,
];

try {
    $assessment = CompetencyAssessment::create($testData);
    echo "✅ Assessment created successfully with ID: {$assessment->id}\n";
    
    // Clean up
    $assessment->delete();
    echo "✅ Test assessment deleted\n";
    
} catch (Exception $e) {
    echo "❌ Assessment creation failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "Test completed.\n";