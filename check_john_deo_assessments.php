<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;

echo "=== CHECKING JOHN DEO ASSESSMENTS ===\n\n";

// From the logs, we know User ID 25 is logged in
$userId = 25;

echo "Checking User ID: $userId\n";

$user = User::find($userId);
if (!$user) {
    echo "ERROR: User not found!\n";
    exit;
}

echo "User: {$user->name} ({$user->email})\n\n";

// Check all possible employee records
echo "=== EMPLOYEE RECORDS ===\n";
$employees = Employee::where('user_id', $userId)->get();
echo "Employee records for User ID $userId: " . $employees->count() . "\n";

foreach ($employees as $emp) {
    echo "  Employee ID: {$emp->id}\n";
}

// Also check if there are employees with similar names
$similarEmployees = Employee::whereHas('user', function($q) {
    $q->where('name', 'like', '%John%')
      ->orWhere('name', 'like', '%Deo%')
      ->orWhere('name', 'like', '%doee%');
})->with('user')->get();

echo "\nEmployees with similar names:\n";
foreach ($similarEmployees as $emp) {
    echo "  Employee ID: {$emp->id}, User ID: {$emp->user_id}, Name: {$emp->user->name}\n";
}

// Check assessments assigned TO User ID 25 as assessor
echo "\n=== ASSESSMENTS WHERE USER IS ASSESSOR ===\n";
$assessorAssessments = CompetencyAssessment::where('assessor_id', $userId)
    ->with(['employee.user', 'competency'])
    ->get();

echo "Assessments where User ID $userId is assessor: " . $assessorAssessments->count() . "\n";
foreach ($assessorAssessments as $assessment) {
    echo "  - ID {$assessment->id}: {$assessment->employee->user->name} - {$assessment->competency->name} ({$assessment->assessment_type}, {$assessment->status})\n";
}

// Check assessments for ALL employees that might belong to this user
echo "\n=== CHECKING ALL POSSIBLE EMPLOYEE MATCHES ===\n";
foreach ($similarEmployees as $emp) {
    $empAssessments = CompetencyAssessment::where('employee_id', $emp->id)
        ->with(['competency', 'assessor'])
        ->get();
    
    if ($empAssessments->count() > 0) {
        echo "Employee ID {$emp->id} ({$emp->user->name}) has {$empAssessments->count()} assessments:\n";
        foreach ($empAssessments as $assessment) {
            echo "  - ID {$assessment->id}: {$assessment->competency->name} ({$assessment->assessment_type}, {$assessment->status}) - Assessor: {$assessment->assessor->name}\n";
        }
        echo "\n";
    }
}

// Check recent assessments created by Administrator
echo "=== RECENT ASSESSMENTS BY ADMINISTRATOR ===\n";
$adminUser = User::where('name', 'like', '%Administrator%')
    ->orWhere('name', 'like', '%Admin%')
    ->first();

if ($adminUser) {
    echo "Administrator User ID: {$adminUser->id}\n";
    $recentAssessments = CompetencyAssessment::where('assessor_id', $adminUser->id)
        ->where('created_at', '>=', now()->subHours(6))
        ->with(['employee.user', 'competency'])
        ->get();
    
    echo "Recent assessments created by Administrator: " . $recentAssessments->count() . "\n";
    foreach ($recentAssessments as $assessment) {
        echo "  - ID {$assessment->id}: {$assessment->employee->user->name} - {$assessment->competency->name} ({$assessment->assessment_type})\n";
    }
}

echo "\n=== DONE ===\n";