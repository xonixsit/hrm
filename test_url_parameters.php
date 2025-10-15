<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;
use Illuminate\Http\Request;

echo "=== TESTING URL PARAMETERS ISSUE ===\n\n";

// Test with user ID 2 who has assessments
$user = User::find(2);
if (!$user) {
    echo "User not found\n";
    exit;
}

echo "Testing with User: {$user->name} (ID: {$user->id})\n";

$employee = Employee::where('user_id', $user->id)->first();
echo "Employee ID: {$employee->id}\n\n";

// Test different request scenarios
$testCases = [
    'No parameters' => [],
    'Status filter: draft' => ['status' => 'draft'],
    'Status filter: submitted' => ['status' => 'submitted'],
    'Status filter: approved' => ['status' => 'approved'],
    'Assessment cycle filter: 1' => ['assessment_cycle_id' => 1],
    'Assessment cycle filter: null' => ['assessment_cycle_id' => null],
    'Assessment cycle filter: empty' => ['assessment_cycle_id' => ''],
];

foreach ($testCases as $testName => $params) {
    echo "=== Testing: $testName ===\n";
    
    // Create a mock request
    $request = new Request($params);
    
    // Build the query exactly like in myAssessments
    $query = CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle'])
        ->where(function ($q) use ($user, $employee) {
            $q->where('assessor_id', $user->id);
            if ($employee) {
                $q->orWhere(function ($subQ) use ($employee) {
                    $subQ->where('employee_id', $employee->id)
                         ->where('assessment_type', 'self');
                });
            }
        });

    // Apply filters
    if ($request->filled('status')) {
        $query->where('status', $request->status);
        echo "Applied status filter: {$request->status}\n";
    }

    if ($request->filled('assessment_cycle_id')) {
        $query->where('assessment_cycle_id', $request->assessment_cycle_id);
        echo "Applied assessment_cycle_id filter: {$request->assessment_cycle_id}\n";
    }
    
    $count = $query->count();
    echo "Results: $count assessments\n";
    
    if ($count > 0) {
        $assessments = $query->get();
        foreach ($assessments as $assessment) {
            echo "  - ID {$assessment->id}: {$assessment->competency->name} ({$assessment->status})\n";
        }
    }
    
    echo "SQL: " . $query->toSql() . "\n";
    echo "Bindings: " . json_encode($query->getBindings()) . "\n";
    echo "---\n\n";
}

// Check if there are any hidden URL parameters that might be causing issues
echo "=== CHECKING FOR COMMON ISSUES ===\n";

// Check if there are any assessments with NULL assessment_cycle_id
$nullCycleCount = CompetencyAssessment::where('employee_id', $employee->id)
    ->whereNull('assessment_cycle_id')
    ->count();
echo "Assessments with NULL assessment_cycle_id for this employee: $nullCycleCount\n";

// Check if there are any active assessment cycles
$activeCycles = \App\Models\AssessmentCycle::where('is_active', true)->count();
echo "Active assessment cycles: $activeCycles\n";

echo "\n=== DONE ===\n";