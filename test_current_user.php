<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;

echo "=== TESTING CURRENT USER ISSUE ===\n\n";

// Let's test with the user who is having the issue
// Based on your URL, it seems like you're testing on hrm.xonixs.com
// Let's check what users exist and their assessments

echo "Available users with employee records:\n";
$users = User::whereHas('employee')->take(10)->get();

foreach ($users as $user) {
    $employee = Employee::where('user_id', $user->id)->first();
    
    // Test the exact query from myAssessments
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
    
    $count = $query->count();
    
    echo "User: {$user->name} (ID: {$user->id}, Email: {$user->email})\n";
    echo "  Employee ID: {$employee->id}\n";
    echo "  My Assessments Count: $count\n";
    
    if ($count > 0) {
        $assessments = $query->get();
        echo "  Assessments:\n";
        foreach ($assessments as $assessment) {
            echo "    - ID {$assessment->id}: {$assessment->competency->name} ({$assessment->assessment_type}, {$assessment->status})\n";
        }
    }
    echo "---\n";
}

echo "\n=== CHECKING FOR SPECIFIC ISSUES ===\n";

// Check if there are any assessments at all
$totalAssessments = CompetencyAssessment::count();
echo "Total assessments in database: $totalAssessments\n";

// Check if there are any self-assessments
$selfAssessments = CompetencyAssessment::where('assessment_type', 'self')->count();
echo "Total self-assessments: $selfAssessments\n";

// Check if there are any draft assessments
$draftAssessments = CompetencyAssessment::where('status', 'draft')->count();
echo "Total draft assessments: $draftAssessments\n";

// Check recent assessments
echo "\nRecent assessments (last 5):\n";
$recent = CompetencyAssessment::with(['employee.user', 'competency', 'assessor'])
    ->orderBy('created_at', 'desc')
    ->take(5)
    ->get();

foreach ($recent as $assessment) {
    echo "ID {$assessment->id}: {$assessment->employee->user->name} - {$assessment->competency->name} ({$assessment->assessment_type}, {$assessment->status}) - Assessor: {$assessment->assessor->name}\n";
}

echo "\n=== DONE ===\n";