<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

echo "=== TESTING HTTP REQUEST TO MY-ASSESSMENTS ===\n\n";

// Test with user ID 2 (who has assessments)
$user = User::find(2);
Auth::login($user);

echo "Logged in as: {$user->name} (ID: {$user->id})\n\n";

// Create a mock request
$request = Request::create('/my-assessments', 'GET');

try {
    // Process the request through the application
    $response = $kernel->handle($request);
    
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Headers:\n";
    foreach ($response->headers->all() as $key => $values) {
        echo "  $key: " . implode(', ', $values) . "\n";
    }
    
    $content = $response->getContent();
    
    // Check if it's an Inertia response
    if ($response->headers->get('content-type') === 'application/json') {
        $data = json_decode($content, true);
        if (isset($data['component']) && $data['component'] === 'CompetencyAssessments/MyAssessments') {
            echo "\nInertia Component: " . $data['component'] . "\n";
            echo "Props:\n";
            
            if (isset($data['props']['assessments'])) {
                $assessments = $data['props']['assessments'];
                echo "  Assessments Total: " . ($assessments['total'] ?? 'N/A') . "\n";
                echo "  Assessments Count: " . count($assessments['data'] ?? []) . "\n";
                
                if (!empty($assessments['data'])) {
                    echo "  First Assessment:\n";
                    $first = $assessments['data'][0];
                    echo "    ID: " . ($first['id'] ?? 'N/A') . "\n";
                    echo "    Employee: " . ($first['employee']['user']['name'] ?? 'N/A') . "\n";
                    echo "    Competency: " . ($first['competency']['name'] ?? 'N/A') . "\n";
                    echo "    Status: " . ($first['status'] ?? 'N/A') . "\n";
                }
            }
            
            if (isset($data['props']['stats'])) {
                $stats = $data['props']['stats'];
                echo "  Stats:\n";
                echo "    Total: " . ($stats['total'] ?? 'N/A') . "\n";
                echo "    Pending: " . ($stats['pending'] ?? 'N/A') . "\n";
                echo "    Completed: " . ($stats['completed'] ?? 'N/A') . "\n";
            }
        }
    } else {
        echo "\nResponse Content (first 500 chars):\n";
        echo substr($content, 0, 500) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== DONE ===\n";