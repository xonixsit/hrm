<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;
use Illuminate\Http\Request;

echo "=== TESTING THE FIX ===" . PHP_EOL;

// Test with the user who should have assessments
$testUserId = 522; // Dulce Keeling

$user = User::find($testUserId);
$employee = Employee::where('user_id', $user->id)->first();

echo "User: {$user->name} (ID: {$user->id})" . PHP_EOL;
echo "Employee ID: {$employee->id}" . PHP_EOL;

// Simulate the myAssessments query WITHOUT the employee_id filter
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

// Apply only status and assessment_cycle_id filters (no employee_id filter)
// Simulating no filters for this test

$assessments = $query->orderBy('created_at', 'desc')->paginate(15);

echo "Results WITHOUT employee_id filter:" . PHP_EOL;
echo "Total assessments: {$assessments->total()}" . PHP_EOL;
echo "Assessments on page: {$assessments->count()}" . PHP_EOL;

foreach ($assessments as $assessment) {
    echo "  - ID: {$assessment->id} | Employee: {$assessment->employee->user->name} | Type: {$assessment->assessment_type} | Status: {$assessment->status}" . PHP_EOL;
}

// Test stats
$statsQuery = CompetencyAssessment::where(function ($q) use ($user, $employee) {
    $q->where('assessor_id', $user->id);
    if ($employee) {
        $q->orWhere(function ($subQ) use ($employee) {
            $subQ->where('employee_id', $employee->id)
                 ->where('assessment_type', 'self');
        });
    }
});

$stats = [
    'total' => (clone $statsQuery)->count(),
    'pending' => (clone $statsQuery)->where('status', 'draft')->count(),
    'completed' => (clone $statsQuery)->whereIn('status', ['submitted', 'approved'])->count(),
];

echo "Stats WITHOUT employee_id filter:" . PHP_EOL;
echo "- Total: {$stats['total']}" . PHP_EOL;
echo "- Pending: {$stats['pending']}" . PHP_EOL;
echo "- Completed: {$stats['completed']}" . PHP_EOL;