<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;

echo "=== CHECKING USER ACCESS ISSUES ===\n\n";

// Check if the logged-in user is the one having issues
echo "Which user is having trouble seeing their assessments?\n";
echo "Enter user ID (or press Enter to check all users with 0 assessments): ";
$handle = fopen("php://stdin", "r");
$input = trim(fgets($handle));
fclose($handle);

if ($input) {
    $userId = (int)$input;
    $users = User::where('id', $userId)->get();
} else {
    // Find users who should have assessments but might not be seeing them
    $users = User::whereHas('employee')->get();
}

echo "\n=== ANALYSIS RESULTS ===\n";

$usersWithIssues = [];
$usersWorking = [];

foreach ($users as $user) {
    $employee = Employee::where('user_id', $user->id)->first();
    
    if (!$employee) {
        continue; // Skip users without employee records
    }
    
    // Count assessments using the same logic as myAssessments method
    $myAssessmentsCount = CompetencyAssessment::where(function ($q) use ($user, $employee) {
        $q->where('assessor_id', $user->id);
        if ($employee) {
            $q->orWhere(function ($subQ) use ($employee) {
                $subQ->where('employee_id', $employee->id)
                     ->where('assessment_type', 'self');
            });
        }
    })->count();
    
    // Count all assessments for this employee
    $totalEmployeeAssessments = CompetencyAssessment::where('employee_id', $employee->id)->count();
    
    $userInfo = [
        'id' => $user->id,
        'name' => $user->name,
        'employee_id' => $employee->id,
        'my_assessments' => $myAssessmentsCount,
        'total_employee_assessments' => $totalEmployeeAssessments,
        'roles' => $user->roles->pluck('name')->toArray()
    ];
    
    if ($myAssessmentsCount === 0 && $totalEmployeeAssessments > 0) {
        $usersWithIssues[] = $userInfo;
    } else {
        $usersWorking[] = $userInfo;
    }
}

echo "Users with potential issues (have assessments but myAssessments returns 0):\n";
if (empty($usersWithIssues)) {
    echo "  None found - all users are seeing their assessments correctly!\n";
} else {
    foreach ($usersWithIssues as $user) {
        echo "  User: {$user['name']} (ID: {$user['id']})\n";
        echo "    Employee ID: {$user['employee_id']}\n";
        echo "    My Assessments: {$user['my_assessments']}\n";
        echo "    Total Employee Assessments: {$user['total_employee_assessments']}\n";
        echo "    Roles: " . implode(', ', $user['roles']) . "\n";
        
        // Debug the specific issue
        $assessments = CompetencyAssessment::where('employee_id', $user['employee_id'])->get();
        echo "    Assessment details:\n";
        foreach ($assessments as $assessment) {
            echo "      - ID {$assessment->id}: Type={$assessment->assessment_type}, Assessor={$assessment->assessor_id}, Status={$assessment->status}\n";
        }
        echo "---\n";
    }
}

echo "\nUsers working correctly (sample of first 5):\n";
foreach (array_slice($usersWorking, 0, 5) as $user) {
    echo "  User: {$user['name']} (ID: {$user['id']}) - My Assessments: {$user['my_assessments']}\n";
}

// Check for common data integrity issues
echo "\n=== CHECKING DATA INTEGRITY ===\n";

// Self-assessments where assessor_id doesn't match employee's user_id
$badSelfAssessments = CompetencyAssessment::where('assessment_type', 'self')
    ->whereRaw('assessor_id != (SELECT user_id FROM employees WHERE employees.id = competency_assessments.employee_id)')
    ->get();

if ($badSelfAssessments->count() > 0) {
    echo "Found {$badSelfAssessments->count()} self-assessments with incorrect assessor_id:\n";
    foreach ($badSelfAssessments as $assessment) {
        $employee = Employee::find($assessment->employee_id);
        echo "  Assessment ID {$assessment->id}: Employee {$assessment->employee_id} (user_id: {$employee->user_id}), but assessor_id is {$assessment->assessor_id}\n";
    }
} else {
    echo "All self-assessments have correct assessor_id ✓\n";
}

// Assessments with NULL assessor_id
$nullAssessors = CompetencyAssessment::whereNull('assessor_id')->count();
echo "Assessments with NULL assessor_id: $nullAssessors\n";

echo "\n=== DONE ===\n";