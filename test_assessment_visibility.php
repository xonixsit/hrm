<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;
use Illuminate\Support\Facades\Auth;

echo "=== TESTING ASSESSMENT VISIBILITY ISSUE ===\n\n";

// Let's test with a specific user who might be having issues
echo "Enter a user ID to test (or press Enter for user ID 2): ";
$handle = fopen("php://stdin", "r");
$input = trim(fgets($handle));
$userId = $input ?: 2;
fclose($handle);

echo "Testing with User ID: $userId\n\n";

$user = User::find($userId);
if (!$user) {
    echo "ERROR: User not found!\n";
    exit;
}

echo "User: {$user->name} (ID: {$user->id})\n";
echo "User roles: " . $user->roles->pluck('name')->join(', ') . "\n";

$employee = Employee::where('user_id', $user->id)->first();
if (!$employee) {
    echo "ERROR: No employee record found!\n";
    exit;
}

echo "Employee ID: {$employee->id}\n\n";

// Test the exact query from myAssessments
echo "=== TESTING MY ASSESSMENTS QUERY ===\n";

$query = CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle'])
    ->where(function ($q) use ($user, $employee) {
        // Include assessments where user is the assessor
        $q->where('assessor_id', $user->id);
        
        // Include self-assessments where user is the employee being assessed
        if ($employee) {
            $q->orWhere(function ($subQ) use ($employee) {
                $subQ->where('employee_id', $employee->id)
                     ->where('assessment_type', 'self');
            });
        }
    });

echo "SQL: " . $query->toSql() . "\n";
echo "Bindings: " . json_encode($query->getBindings()) . "\n\n";

$assessments = $query->get();
echo "Total assessments found: " . $assessments->count() . "\n\n";

if ($assessments->count() > 0) {
    echo "=== ASSESSMENTS FOUND ===\n";
    foreach ($assessments as $assessment) {
        echo "Assessment ID: {$assessment->id}\n";
        echo "  Employee: {$assessment->employee->user->name} (ID: {$assessment->employee_id})\n";
        echo "  Competency: {$assessment->competency->name}\n";
        echo "  Assessor: {$assessment->assessor->name} (ID: {$assessment->assessor_id})\n";
        echo "  Type: {$assessment->assessment_type}\n";
        echo "  Status: {$assessment->status}\n";
        echo "  Created: {$assessment->created_at}\n";
        echo "  Updated: {$assessment->updated_at}\n";
        echo "---\n";
    }
} else {
    echo "No assessments found. Let's debug...\n\n";
    
    // Check assessments where user is assessor
    $assessorCount = CompetencyAssessment::where('assessor_id', $user->id)->count();
    echo "Assessments where user is assessor: $assessorCount\n";
    
    if ($assessorCount > 0) {
        $assessorAssessments = CompetencyAssessment::where('assessor_id', $user->id)->get();
        foreach ($assessorAssessments as $assessment) {
            echo "  - Assessment ID {$assessment->id}: Employee {$assessment->employee_id}, Type: {$assessment->assessment_type}\n";
        }
    }
    
    // Check self-assessments for this employee
    $selfCount = CompetencyAssessment::where('employee_id', $employee->id)
        ->where('assessment_type', 'self')->count();
    echo "Self-assessments for this employee: $selfCount\n";
    
    if ($selfCount > 0) {
        $selfAssessments = CompetencyAssessment::where('employee_id', $employee->id)
            ->where('assessment_type', 'self')->get();
        foreach ($selfAssessments as $assessment) {
            echo "  - Assessment ID {$assessment->id}: Assessor {$assessment->assessor_id}, Type: {$assessment->assessment_type}\n";
        }
    }
    
    // Check all assessments for this employee
    $allCount = CompetencyAssessment::where('employee_id', $employee->id)->count();
    echo "All assessments for this employee: $allCount\n";
    
    if ($allCount > 0) {
        $allAssessments = CompetencyAssessment::where('employee_id', $employee->id)->get();
        foreach ($allAssessments as $assessment) {
            echo "  - Assessment ID {$assessment->id}: Assessor {$assessment->assessor_id}, Type: {$assessment->assessment_type}, Status: {$assessment->status}\n";
        }
    }
}

echo "\n=== CHECKING FOR COMMON ISSUES ===\n";

// Check if there are assessments with NULL assessor_id
$nullAssessorCount = CompetencyAssessment::whereNull('assessor_id')->count();
echo "Assessments with NULL assessor_id: $nullAssessorCount\n";

// Check if there are self-assessments with wrong assessor_id
$wrongSelfAssessments = CompetencyAssessment::where('assessment_type', 'self')
    ->whereRaw('assessor_id != (SELECT user_id FROM employees WHERE employees.id = competency_assessments.employee_id)')
    ->count();
echo "Self-assessments with wrong assessor_id: $wrongSelfAssessments\n";

echo "\n=== DONE ===\n";