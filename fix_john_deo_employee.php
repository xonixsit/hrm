<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;

echo "=== FIXING JOHN DEO EMPLOYEE RECORD ===\n\n";

// Target user from the logs
$userId = 25;

$user = User::find($userId);
if (!$user) {
    echo "ERROR: User ID $userId not found!\n";
    exit;
}

echo "User: {$user->name} ({$user->email})\n";

// Check if employee record exists
$employee = Employee::where('user_id', $userId)->first();

if ($employee) {
    echo "Employee record already exists: ID {$employee->id}\n";
} else {
    echo "No employee record found. Creating one...\n";
    
    try {
        $employee = Employee::create([
            'user_id' => $user->id,
            'employee_number' => 'EMP-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
            'position' => 'Employee',
            'hire_date' => $user->created_at ?? now(),
            'status' => 'active'
        ]);
        
        echo "✓ Created employee record ID {$employee->id}\n";
        echo "  Employee Number: {$employee->employee_number}\n";
        echo "  Position: {$employee->position}\n";
        echo "  Status: {$employee->status}\n";
        
    } catch (\Exception $e) {
        echo "✗ Failed to create employee record: {$e->getMessage()}\n";
        exit;
    }
}

// Now check if there are any assessments that should be linked to this user
echo "\n=== CHECKING FOR ASSESSMENTS ===\n";

// Look for assessments assigned to this user as assessor
$assessorAssessments = \App\Models\CompetencyAssessment::where('assessor_id', $userId)->count();
echo "Assessments where user is assessor: $assessorAssessments\n";

// Look for assessments for this employee
$employeeAssessments = \App\Models\CompetencyAssessment::where('employee_id', $employee->id)->count();
echo "Assessments for this employee: $employeeAssessments\n";

// Look for assessments that might match by name/email
$matchingAssessments = \App\Models\CompetencyAssessment::whereHas('employee.user', function ($q) use ($user) {
    $q->where('email', $user->email)
      ->orWhere('name', $user->name);
})->count();
echo "Assessments matching by name/email: $matchingAssessments\n";

echo "\n=== SOLUTION ===\n";
if ($employeeAssessments > 0 || $assessorAssessments > 0 || $matchingAssessments > 0) {
    echo "✓ User should now be able to see their assessments in My Assessments page\n";
} else {
    echo "⚠ No assessments found for this user. They may need to be created or assigned.\n";
}

echo "\n=== DONE ===\n";