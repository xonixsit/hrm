<?php

require_once 'vendor/autoload.php';

use App\Models\Employee;
use App\Models\User;
use App\Services\BirthdayService;
use Carbon\Carbon;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Birthday Functionality\n";
echo "==============================\n\n";

// Find the first employee
$employee = Employee::with('user')->first();

if ($employee) {
    echo "Found employee: " . $employee->user->name . "\n";
    echo "Current birthday: " . ($employee->date_of_birth ? $employee->date_of_birth->format('Y-m-d') : 'Not set') . "\n";
    
    // Set their birthday to today for testing
    $employee->date_of_birth = Carbon::today()->subYears(25);
    $employee->save();
    
    echo "Updated birthday to: " . $employee->date_of_birth->format('Y-m-d') . "\n\n";
    
    // Test the birthday service
    $birthdayService = new BirthdayService();
    $todaysBirthdays = $birthdayService->getTodaysBirthdays();
    
    echo "Today's birthdays count: " . $todaysBirthdays->count() . "\n";
    
    foreach ($todaysBirthdays as $bday) {
        echo "- " . $bday->user->name . " (ID: " . $bday->id . ", User ID: " . $bday->user_id . ")\n";
    }
    
    echo "\nTesting current user birthday detection...\n";
    
    // Simulate checking if current user has birthday today
    $currentUser = $employee->user;
    $currentUserBirthday = $todaysBirthdays->first(function ($emp) use ($currentUser) {
        return $emp->user_id === $currentUser->id;
    });
    
    if ($currentUserBirthday) {
        echo "✅ Current user birthday detected!\n";
        echo "User: " . $currentUserBirthday->user->name . "\n";
        echo "Age: " . $currentUserBirthday->getAge() . "\n";
    } else {
        echo "❌ Current user birthday NOT detected\n";
    }
    
} else {
    echo "No employees found in database\n";
}

echo "\nDone!\n";