<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Notifications\WelcomeEmployeeNotification;
use Illuminate\Support\Facades\Hash;

try {
    // Find a department to use
    $department = Department::first();
    
    if (!$department) {
        echo "Error: No departments found. Please create a department first.\n";
        exit(1);
    }
    
    // Create a test user
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test.welcome@example.com',
        'password' => Hash::make('password123'),
    ]);
    
    $user->assignRole('Employee');
    
    // Create an employee record
    $employee = Employee::create([
        'user_id' => $user->id,
        'department_id' => $department->id,
        'employee_code' => 'TEST' . rand(1000, 9999),
        'job_title' => 'Test Position',
        'join_date' => now(),
        'contract_type' => 'Full-time',
    ]);
    
    // Send the welcome notification
    $user->notify(new WelcomeEmployeeNotification($employee));
    
    echo "Welcome email sent successfully to {$user->email}!\n";
    echo "User ID: {$user->id}\n";
    echo "Employee ID: {$employee->id}\n";
    
} catch (\Exception $e) {
    echo "Error: {$e->getMessage()}\n";
    echo "File: {$e->getFile()}\n";
    echo "Line: {$e->getLine()}\n";
}