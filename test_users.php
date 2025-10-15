<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;

echo "=== TESTING MULTIPLE USERS ===\n";

// Find users who should have assessments
$users = User::whereHas('employee')->take(10)->get();

foreach ($users as $user) {
    $employee = Employee::where('user_id', $user->id)->first();
    
    $assessmentCount = CompetencyAssessment::where(function ($q) use ($user, $employee) {
        $q->where('assessor_id', $user->id);
        if ($employee) {
            $q->orWhere(function ($subQ) use ($employee) {
                $subQ->where('employee_id', $employee->id)
                     ->where('assessment_type', 'self');
            });
        }
    })->count();
    
    // Also check total assessments for this employee
    $totalEmployeeAssessments = CompetencyAssessment::where('employee_id', $employee->id)->count();
    
    echo "User: {$user->name} (ID: {$user->id})\n";
    echo "  Employee ID: {$employee->id}\n";
    echo "  My Assessments: $assessmentCount\n";
    echo "  Total Employee Assessments: $totalEmployeeAssessments\n";
    echo "---\n";
}