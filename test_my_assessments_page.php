<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\CompetencyAssessment;
use App\Http\Controllers\CompetencyAssessmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

echo "=== TESTING MY ASSESSMENTS PAGE ===\n\n";

// Test with different users
$testUserIds = [1, 2, 3, 4, 5];

foreach ($testUserIds as $userId) {
    echo "Testing User ID: $userId\n";
    
    $user = User::find($userId);
    if (!$user) {
        echo "  User not found\n";
        continue;
    }
    
    echo "  User: {$user->name}\n";
    
    // Simulate authentication
    Auth::login($user);
    
    $employee = Employee::where('user_id', $user->id)->first();
    if (!$employee) {
        echo "  No employee record found\n";
        continue;
    }
    
    echo "  Employee ID: {$employee->id}\n";
    
    // Test the controller method directly
    $controller = new CompetencyAssessmentController(app(\App\Services\CompetencyAssessmentService::class));
    $request = new Request();
    
    try {
        // This would normally return an Inertia response, but we can access the data
        $response = $controller->myAssessments($request);
        
        // Get the data that would be passed to the Vue component
        $viewData = $response->toResponse($request)->getData();
        $props = json_decode($viewData->page['props'], true);
        
        echo "  Assessments found: " . count($props['assessments']['data']) . "\n";
        echo "  Total assessments: " . $props['assessments']['total'] . "\n";
        echo "  Stats - Total: " . $props['stats']['total'] . ", Pending: " . $props['stats']['pending'] . ", Completed: " . $props['stats']['completed'] . "\n";
        
        if (count($props['assessments']['data']) > 0) {
            echo "  First assessment:\n";
            $first = $props['assessments']['data'][0];
            echo "    ID: {$first['id']}\n";
            echo "    Employee: {$first['employee']['user']['name']}\n";
            echo "    Competency: {$first['competency']['name']}\n";
            echo "    Type: {$first['assessment_type']}\n";
            echo "    Status: {$first['status']}\n";
        }
        
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . "\n";
    }
    
    echo "---\n";
}

echo "\n=== DONE ===\n";