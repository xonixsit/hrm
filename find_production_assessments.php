<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;

echo "=== FINDING PRODUCTION ASSESSMENTS ===\n\n";

// From the logs, we know:
$userId = 25;
$employeeId = 19;
$userEmail = "xonixsit@outlook.com";
$userName = "John doee";

echo "Target User: ID $userId, Name: '$userName', Email: '$userEmail'\n";
echo "Target Employee: ID $employeeId\n\n";

// Let's run the exact query from the logs to see what's happening
echo "=== TESTING EXACT QUERY FROM LOGS ===\n";

$query = CompetencyAssessment::where(function ($q) use ($userId, $employeeId, $userEmail, $userName) {
    $q->where('assessor_id', $userId)
      ->orWhere(function ($subQ) use ($employeeId) {
          $subQ->where('employee_id', $employeeId)
               ->where('assessment_type', 'self');
      })
      ->orWhereHas('employee.user', function ($userQuery) use ($userEmail, $userName) {
          $userQuery->where('email', $userEmail)
                    ->orWhere('name', $userName);
      });
});

$count = $query->count();
echo "Query result count: $count\n";

if ($count > 0) {
    $assessments = $query->with(['employee.user', 'competency'])->get();
    foreach ($assessments as $assessment) {
        echo "  - ID {$assessment->id}: {$assessment->employee->user->name} - {$assessment->competency->name}\n";
    }
} else {
    echo "No assessments found with exact query.\n\n";
    
    // Let's debug each part of the query
    echo "=== DEBUGGING QUERY PARTS ===\n";
    
    // Part 1: assessor_id = 25
    $assessorCount = CompetencyAssessment::where('assessor_id', $userId)->count();
    echo "1. Assessments where assessor_id = $userId: $assessorCount\n";
    
    // Part 2: employee_id = 19 AND assessment_type = 'self'
    $selfCount = CompetencyAssessment::where('employee_id', $employeeId)
        ->where('assessment_type', 'self')->count();
    echo "2. Self-assessments for employee_id = $employeeId: $selfCount\n";
    
    // Part 3: employee.user email match
    $emailCount = CompetencyAssessment::whereHas('employee.user', function ($userQuery) use ($userEmail) {
        $userQuery->where('email', $userEmail);
    })->count();
    echo "3. Assessments where employee.user.email = '$userEmail': $emailCount\n";
    
    // Part 4: employee.user name match
    $nameCount = CompetencyAssessment::whereHas('employee.user', function ($userQuery) use ($userName) {
        $userQuery->where('name', $userName);
    })->count();
    echo "4. Assessments where employee.user.name = '$userName': $nameCount\n";
    
    // Let's check what users exist with similar names/emails
    echo "\n=== CHECKING SIMILAR USERS ===\n";
    
    $similarUsers = User::where('email', 'like', '%xonixsit%')
        ->orWhere('name', 'like', '%John%')
        ->orWhere('name', 'like', '%Deo%')
        ->orWhere('name', 'like', '%doee%')
        ->get();
    
    foreach ($similarUsers as $user) {
        echo "User ID {$user->id}: '{$user->name}' ({$user->email})\n";
        
        $employee = Employee::where('user_id', $user->id)->first();
        if ($employee) {
            $assessmentCount = CompetencyAssessment::where('employee_id', $employee->id)->count();
            echo "  Employee ID: {$employee->id}, Assessments: $assessmentCount\n";
            
            if ($assessmentCount > 0) {
                $assessments = CompetencyAssessment::where('employee_id', $employee->id)
                    ->with(['competency'])
                    ->take(3)
                    ->get();
                foreach ($assessments as $assessment) {
                    echo "    - {$assessment->competency->name} ({$assessment->status})\n";
                }
            }
        }
        echo "\n";
    }
    
    // Check recent assessments that might belong to this user
    echo "=== RECENT ASSESSMENTS (last 6 hours) ===\n";
    $recentAssessments = CompetencyAssessment::where('created_at', '>=', now()->subHours(6))
        ->with(['employee.user', 'competency'])
        ->get();
    
    foreach ($recentAssessments as $assessment) {
        echo "ID {$assessment->id}: {$assessment->employee->user->name} ({$assessment->employee->user->email}) - {$assessment->competency->name}\n";
    }
}

echo "\n=== DONE ===\n";