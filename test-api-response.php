<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing API Response Structure ===\n\n";

// Get the actual API response by making a request
$client = new GuzzleHttp\Client();

try {
    // Make a request to the attendance API endpoint
    $response = $client->request('GET', 'http://localhost:8000/api/attendances', [
        'headers' => [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . getTestToken(), // We'll need to handle auth
        ]
    ]);
    
    $data = json_decode($response->getBody(), true);
    
    echo "API Response structure:\n";
    echo "Total records: " . count($data['data'] ?? []) . "\n";
    
    // Check for Alex John duplicates
    $alexRecords = array_filter($data['data'] ?? [], function($att) {
        return $att['employee']['user']['name'] === 'Alex John' && $att['date'] === '2025-08-11';
    });
    
    echo "Alex John on 2025-08-11: " . count($alexRecords) . " records\n";
    
} catch (Exception $e) {
    echo "API request failed: " . $e->getMessage() . "\n";
}

// Alternative: Test the controller directly without auth
$controller = new \App\Http\Controllers\AttendanceController();
$request = new \Illuminate\Http\Request();

// Simulate the controller's response
$attendances = \App\Models\Attendance::select('attendances.*')
    ->with(['employee.user'])
    ->whereIn('id', function($subQuery) {
        $subQuery->selectRaw('MAX(id)')
                 ->from('attendances')
                 ->whereNotNull('employee_id')
                 ->whereNotNull('date')
                 ->groupBy('employee_id', 'date');
    })
    ->orderBy('date', 'desc')
    ->paginate(15);

echo "\nController Response:\n";
echo "Total: " . $attendances->total() . "\n";
echo "Per page: " . $attendances->perPage() . "\n";
echo "Current page: " . $attendances->currentPage() . "\n";

// Check Alex John records
$alexRecords = $attendances->filter(function($att) {
    return $att->employee && $att->employee->user && $att->employee->user->name === 'Alex John' && $att->date === '2025-08-11';
});

echo "Alex John on 2025-08-11 in paginated results: " . $alexRecords->count() . " records\n";

function getTestToken() {
    // This is a placeholder - in a real scenario, you'd need proper authentication
    return 'test-token';
}