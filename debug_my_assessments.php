<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\CompetencyAssessment;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "=== DEBUGGING MY ASSESSMENTS ISSUE ===\n\n";

// Test with a specific user ID (you can change this)
$testUserId = 1; // Change this to the actual user ID having issues

echo "Testing with User ID: $testUserId\n";

// Get user and employee info
$user = User::find($testUserId);
if (!$user) {
    echo "ERROR: User with ID $testUserId not found!\n";
    exit;
}

echo "User: {$user->name} (ID: {$user->id})\n";

$employee = Employee::where('user_id', $user->id)->first();
if (!$employee) {
    echo "ERROR: No employee record found for user {$user->id}!\n";
    echo "This is likely the main issue - user needs an employee record.\n";
    exit;
}

echo "Employee: ID {$employee->id}\n\n";

// Test the exact query from myAssessments method
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

// Get the SQL query for debugging
$sql = $query->toSql();
$bindings = $query->getBindings();

echo "SQL Query:\n$sql\n\n";
echo "Bindings: " . json_encode($bindings) . "\n\n";

$assessments = $query->get();
echo "Total assessments found: " . $assessments->count() . "\n\n";

if ($assessments->count() > 0) {
    echo "=== ASSESSMENTS FOUND ===\n";
    foreach ($assessments as $assessment) {
        echo "ID: {$assessment->id}\n";
        echo "Employee: {$assessment->employee->user->name} (ID: {$assessment->employee_id})\n";
        echo "Competency: {$assessment->competency->name}\n";
        echo "Assessor: {$assessment->assessor->name} (ID: {$assessment->assessor_id})\n";
        echo "Type: {$assessment->assessment_type}\n";
        echo "Status: {$assessment->status}\n";
        echo "Created: {$assessment->created_at}\n";
        echo "---\n";
    }
} else {
    echo "No assessments found. Let's check what assessments exist...\n\n";
    
    // Check all assessments for this user as assessor
    $assessorAssessments = CompetencyAssessment::where('assessor_id', $user->id)->get();
    echo "Assessments where user is assessor: " . $assessorAssessments->count() . "\n";
    
    // Check all self-assessments for this employee
    $selfAssessments = CompetencyAssessment::where('employee_id', $employee->id)
        ->where('assessment_type', 'self')->get();
    echo "Self-assessments for this employee: " . $selfAssessments->count() . "\n";
    
    // Check all assessments for this employee (any type)
    $allEmployeeAssessments = CompetencyAssessment::where('employee_id', $employee->id)->get();
    echo "All assessments for this employee: " . $allEmployeeAssessments->count() . "\n";
    
    if ($allEmployeeAssessments->count() > 0) {
        echo "\n=== ALL EMPLOYEE ASSESSMENTS ===\n";
        foreach ($allEmployeeAssessments as $assessment) {
            echo "ID: {$assessment->id}, Type: {$assessment->assessment_type}, Assessor: {$assessment->assessor_id}, Status: {$assessment->status}\n";
        }
    }
}

echo "\n=== CHECKING DATABASE STRUCTURE ===\n";

// Check if there are any assessments at all
$totalAssessments = CompetencyAssessment::count();
echo "Total assessments in database: $totalAssessments\n";

// Check users table
$totalUsers = User::count();
echo "Total users: $totalUsers\n";

// Check employees table
$totalEmployees = Employee::count();
echo "Total employees: $totalEmployees\n";

// Check for users without employee records
$usersWithoutEmployees = User::whereNotIn('id', Employee::pluck('user_id'))->count();
echo "Users without employee records: $usersWithoutEmployees\n";

echo "\n=== DONE ===\n";