<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;

echo "=== FINDING JOHN DEO ===\n\n";

// Search for users with "John" and "Deo" variations
$searchTerms = ['John Deo', 'John doee', 'John', 'Deo', 'doee'];

foreach ($searchTerms as $term) {
    echo "Searching for users with name containing '$term':\n";
    $users = User::where('name', 'like', "%$term%")->get();
    
    foreach ($users as $user) {
        echo "  User ID: {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
        
        $employee = Employee::where('user_id', $user->id)->first();
        if ($employee) {
            echo "    Employee ID: {$employee->id}\n";
            
            // Check assessments for this employee
            $assessments = CompetencyAssessment::where('employee_id', $employee->id)
                ->with(['competency'])
                ->get();
            
            if ($assessments->count() > 0) {
                echo "    Assessments: {$assessments->count()}\n";
                foreach ($assessments->take(3) as $assessment) {
                    echo "      - {$assessment->competency->name} ({$assessment->status})\n";
                }
                if ($assessments->count() > 3) {
                    echo "      - ... and " . ($assessments->count() - 3) . " more\n";
                }
            } else {
                echo "    No assessments found\n";
            }
        } else {
            echo "    No employee record\n";
        }
        echo "\n";
    }
}

// Also search by email patterns
echo "=== SEARCHING BY EMAIL PATTERNS ===\n";
$emailPatterns = ['xonixsit@outlook.com', '%john%', '%deo%'];

foreach ($emailPatterns as $pattern) {
    echo "Searching for email like '$pattern':\n";
    $users = User::where('email', 'like', $pattern)->get();
    
    foreach ($users as $user) {
        echo "  User ID: {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
        
        $employee = Employee::where('user_id', $user->id)->first();
        if ($employee) {
            echo "    Employee ID: {$employee->id}\n";
            $assessmentCount = CompetencyAssessment::where('employee_id', $employee->id)->count();
            echo "    Assessments: $assessmentCount\n";
        }
        echo "\n";
    }
}

// Check recent assessments to find the pattern
echo "=== RECENT ASSESSMENTS (last 24 hours) ===\n";
$recentAssessments = CompetencyAssessment::where('created_at', '>=', now()->subDay())
    ->with(['employee.user', 'competency', 'assessor'])
    ->orderBy('created_at', 'desc')
    ->get();

echo "Recent assessments: " . $recentAssessments->count() . "\n";
foreach ($recentAssessments as $assessment) {
    echo "  - Employee: {$assessment->employee->user->name} (User ID: {$assessment->employee->user_id}, Employee ID: {$assessment->employee_id})\n";
    echo "    Competency: {$assessment->competency->name}\n";
    echo "    Assessor: {$assessment->assessor->name} (ID: {$assessment->assessor_id})\n";
    echo "    Created: {$assessment->created_at}\n\n";
}

echo "=== DONE ===\n";