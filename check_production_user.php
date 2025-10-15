<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;

echo "=== CHECKING PRODUCTION USER ===\n\n";

// Check the specific user from the logs
$userId = 25;
$employeeId = 19;

echo "Checking User ID: $userId, Employee ID: $employeeId\n";

$user = User::find($userId);
if (!$user) {
    echo "ERROR: User not found!\n";
    exit;
}

echo "User: {$user->name} ({$user->email})\n";

$employee = Employee::find($employeeId);
if (!$employee) {
    echo "ERROR: Employee not found!\n";
    exit;
}

echo "Employee: ID {$employee->id}, User ID: {$employee->user_id}\n\n";

// Verify the user-employee relationship
if ($employee->user_id !== $user->id) {
    echo "WARNING: Employee user_id ({$employee->user_id}) doesn't match user ID ({$user->id})\n";
}

// Check assessments using the exact query from the logs
echo "=== CHECKING ASSESSMENTS ===\n";

// Direct assessments where user is assessor
$directAssessments = CompetencyAssessment::where('assessor_id', $userId)->get();
echo "Assessments where user is assessor: " . $directAssessments->count() . "\n";

// Self-assessments for this employee
$selfAssessments = CompetencyAssessment::where('employee_id', $employeeId)
    ->where('assessment_type', 'self')->get();
echo "Self-assessments for this employee: " . $selfAssessments->count() . "\n";

// All assessments for this employee
$allEmployeeAssessments = CompetencyAssessment::where('employee_id', $employeeId)->get();
echo "All assessments for this employee: " . $allEmployeeAssessments->count() . "\n";

// Check if there are any assessments for this user in any capacity
$anyAssessments = CompetencyAssessment::where('assessor_id', $userId)
    ->orWhere('employee_id', $employeeId)
    ->get();
echo "Any assessments involving this user/employee: " . $anyAssessments->count() . "\n";

if ($anyAssessments->count() > 0) {
    echo "\nFound assessments:\n";
    foreach ($anyAssessments as $assessment) {
        echo "  - ID {$assessment->id}: Employee {$assessment->employee_id}, Assessor {$assessment->assessor_id}, Type: {$assessment->assessment_type}, Status: {$assessment->status}\n";
    }
}

echo "\n=== SOLUTION ===\n";
echo "This user doesn't have any assessments yet. To fix this:\n";
echo "1. Create a self-assessment for this user\n";
echo "2. Or assign assessments to this user as an assessor\n";
echo "3. The 'My Assessments' page will show assessments once they exist\n\n";

// Check if user has the ability to create self-assessments
$competencies = \App\Models\Competency::where('is_active', true)->count();
echo "Available competencies for assessment: $competencies\n";

if ($competencies > 0) {
    echo "\nUser can create self-assessments by:\n";
    echo "1. Going to the Assessment Dashboard\n";
    echo "2. Clicking 'Create Self-Assessment'\n";
    echo "3. Or accessing: /competency-assessments/create-self-assessment\n";
}

echo "\n=== DONE ===\n";