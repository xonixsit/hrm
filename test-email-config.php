<?php

/**
 * Email Configuration Test Script
 * Tests the email configuration and sends a test email
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

echo "=== Email Configuration Test ===\n\n";

// Display current configuration
echo "1. Current Mail Configuration:\n";
echo "   MAIL_MAILER: " . config('mail.default') . "\n";
echo "   MAIL_HOST: " . config('mail.mailers.smtp.host') . "\n";
echo "   MAIL_PORT: " . config('mail.mailers.smtp.port') . "\n";
echo "   MAIL_ENCRYPTION: " . config('mail.mailers.smtp.encryption') . "\n";
echo "   MAIL_USERNAME: " . config('mail.mailers.smtp.username') . "\n";
echo "   MAIL_FROM_ADDRESS: " . config('mail.from.address') . "\n";
echo "   MAIL_FROM_NAME: " . config('mail.from.name') . "\n\n";

// Display queue configuration
echo "2. Queue Configuration:\n";
echo "   QUEUE_CONNECTION: " . config('queue.default') . "\n\n";

// Test email sending
echo "3. Testing Email Send:\n";

try {
    $testEmail = config('mail.from.address');
    
    echo "   Sending test email to: {$testEmail}\n";
    
    Mail::raw('This is a test email from the Xonobics system. If you receive this, your email configuration is working correctly!', function ($message) use ($testEmail) {
        $message->to($testEmail)
                ->subject('Test Email - Xonobics Configuration');
    });
    
    echo "   ✓ Email sent successfully!\n";
    echo "   Check your inbox at: {$testEmail}\n\n";
    
} catch (\Exception $e) {
    echo "   ✗ Error sending email:\n";
    echo "   Error: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    
    // Log the full error
    Log::error('Email test failed', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

// Test WelcomeEmployeeNotification
echo "4. Testing WelcomeEmployeeNotification:\n";

try {
    // Find a test user or create one
    $user = \App\Models\User::first();
    
    if (!$user) {
        echo "   ✗ No users found in database. Please create an employee first.\n\n";
    } else {
        $employee = \App\Models\Employee::where('user_id', $user->id)->first();
        
        if (!$employee) {
            echo "   ✗ No employee record found for user. Please create an employee first.\n\n";
        } else {
            echo "   Testing with user: {$user->name} ({$user->email})\n";
            
            $notification = new \App\Notifications\WelcomeEmployeeNotification($employee);
            $user->notify($notification);
            
            echo "   ✓ WelcomeEmployeeNotification sent successfully!\n";
            echo "   Check inbox at: {$user->email}\n\n";
        }
    }
    
} catch (\Exception $e) {
    echo "   ✗ Error sending notification:\n";
    echo "   Error: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    
    Log::error('WelcomeEmployeeNotification test failed', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

echo "=== Test Complete ===\n";
echo "Check the logs at: storage/logs/laravel.log for detailed information\n";