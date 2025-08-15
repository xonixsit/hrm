<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\WorkReport;
use Carbon\Carbon;

echo "=== Creating Sample Work Reports ===\n\n";

// Find the employee user
$user = User::where('email', 'employee@example.com')->first();

if (!$user) {
    echo "❌ User employee@example.com not found!\n";
    echo "Please run the database seeder first: php artisan db:seed\n";
    exit(1);
}

$employee = $user->employee;

if (!$employee) {
    echo "❌ Employee record not found for employee@example.com!\n";
    echo "Please run the database seeder first: php artisan db:seed\n";
    exit(1);
}

echo "✅ Found employee: {$user->name} (ID: {$employee->id})\n\n";

// Clear existing work reports for this employee
WorkReport::where('employee_id', $employee->id)->delete();
echo "🧹 Cleared existing work reports\n\n";

// Generate work reports for the last 30 days
$startDate = Carbon::now()->subDays(30);
$endDate = Carbon::now();

echo "📅 Generating work reports from {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')}\n\n";

$workReports = [];
$totalDays = 0;

for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
    // Skip weekends for more realistic data
    if ($date->isWeekend()) {
        continue;
    }
    
    $totalDays++;
    
    // Generate realistic but varied data
    $totalCalls = rand(80, 150);
    $successfulCalls = rand(40, 80);
    $notReceived = rand(20, 40);
    $disconnected = rand(5, 15);
    $followUpCalls = rand(10, 25);
    
    // Ensure the numbers make sense
    $remaining = $totalCalls - $successfulCalls - $notReceived - $disconnected;
    if ($remaining < 0) {
        $notReceived = max(0, $notReceived + $remaining);
    }
    
    $workReport = [
        'employee_id' => $employee->id,
        'date' => $date->format('Y-m-d'),
        'calls' => $totalCalls,
        'successful_calls' => $successfulCalls,
        'calls_not_received' => $notReceived,
        'disconnected_calls' => $disconnected,
        'follow_up_calls' => $followUpCalls,
        'emails' => rand(15, 45),
        'whatsapp' => rand(20, 60),
        'sms' => rand(10, 30),
        'notes' => generateRandomNote(),
        'created_at' => $date->format('Y-m-d H:i:s'),
        'updated_at' => $date->format('Y-m-d H:i:s'),
    ];
    
    $workReports[] = $workReport;
}

// Function to generate random notes
function generateRandomNote() {
    $notes = [
        'Good response from clients today. Several interested prospects.',
        'Challenging day with many disconnected calls. Need to review call timing.',
        'Excellent conversion rate today. Clients were very responsive.',
        'Focused on follow-up calls with previous prospects. Good engagement.',
        'Mixed results today. Some clients showed strong interest.',
        'High email response rate. WhatsApp messages were well received.',
        'Productive day with quality conversations and potential leads.',
        'Several clients requested more information via email.',
        'Good day for SMS campaigns. Higher than usual response rate.',
        'Focused on relationship building with existing clients.',
        null, // Some days might not have notes
        null,
    ];
    
    return $notes[array_rand($notes)];
}

// Insert all work reports
foreach ($workReports as $reportData) {
    $reportData['notes'] = generateRandomNote();
    WorkReport::create($reportData);
}

echo "✅ Created {$totalDays} work reports for weekdays\n";
echo "📊 Sample data includes:\n";
echo "   - Varied call volumes (80-150 per day)\n";
echo "   - Realistic success rates (40-80 successful calls)\n";
echo "   - Follow-up calls (10-25 per day)\n";
echo "   - Email activity (15-45 per day)\n";
echo "   - WhatsApp messages (20-60 per day)\n";
echo "   - SMS campaigns (10-30 per day)\n";
echo "   - Random notes for some days\n\n";

// Show some statistics
$totalReports = WorkReport::where('employee_id', $employee->id)->count();
$avgCalls = WorkReport::where('employee_id', $employee->id)->avg('calls');
$totalEmails = WorkReport::where('employee_id', $employee->id)->sum('emails');
$totalWhatsApp = WorkReport::where('employee_id', $employee->id)->sum('whatsapp');

echo "📈 Statistics:\n";
echo "   - Total reports: {$totalReports}\n";
echo "   - Average calls per day: " . round($avgCalls, 1) . "\n";
echo "   - Total emails sent: {$totalEmails}\n";
echo "   - Total WhatsApp messages: {$totalWhatsApp}\n\n";

echo "🎉 Sample work reports created successfully!\n";
echo "You can now view them at: /work-reports\n";
echo "Login as employee@example.com (password: password) to see the data.\n";