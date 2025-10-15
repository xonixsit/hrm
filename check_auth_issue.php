<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;

echo "=== CHECKING AUTHENTICATION ISSUE ===\n\n";

// Check the user from the logs
$loggedUserId = 25;
$loggedEmployeeId = 19;

echo "From logs - User ID: $loggedUserId, Employee ID: $loggedEmployeeId\n\n";

// Check User ID 25
$user25 = User::find(25);
if ($user25) {
    echo "User ID 25: {$user25->name} ({$user25->email})\n";
    $employee25 = Employee::where('user_id', 25)->first();
    if ($employee25) {
        echo "  Has Employee ID: {$employee25->id}\n";
    } else {
        echo "  No employee record found\n";
    }
} else {
    echo "User ID 25 not found\n";
}

// Check Employee ID 19
$employee19 = Employee::find(19);
if ($employee19) {
    echo "\nEmployee ID 19: belongs to User ID {$employee19->user_id}\n";
    $user19 = User::find($employee19->user_id);
    if ($user19) {
        echo "  User: {$user19->name} ({$user19->email})\n";
    }
} else {
    echo "Employee ID 19 not found\n";
}

// Check if there's a user with email "xonixsit@outlook.com"
$userByEmail = User::where('email', 'xonixsit@outlook.com')->first();
if ($userByEmail) {
    echo "\nUser with email 'xonixsit@outlook.com':\n";
    echo "  ID: {$userByEmail->id}, Name: {$userByEmail->name}\n";
    $employeeByEmail = Employee::where('user_id', $userByEmail->id)->first();
    if ($employeeByEmail) {
        echo "  Employee ID: {$employeeByEmail->id}\n";
    } else {
        echo "  No employee record\n";
    }
}

// Check if there's a user named "John doee"
$userByName = User::where('name', 'like', '%John doee%')->first();
if ($userByName) {
    echo "\nUser with name 'John doee':\n";
    echo "  ID: {$userByName->id}, Email: {$userByName->email}\n";
    $employeeByName = Employee::where('user_id', $userByName->id)->first();
    if ($employeeByName) {
        echo "  Employee ID: {$employeeByName->id}\n";
    } else {
        echo "  No employee record\n";
    }
}

echo "\n=== DIAGNOSIS ===\n";
echo "The issue appears to be:\n";
echo "1. User authentication is returning User ID 25\n";
echo "2. But Employee lookup is finding Employee ID 19 (which belongs to User ID 19)\n";
echo "3. This creates a mismatch in the query logic\n\n";

echo "Possible causes:\n";
echo "1. Session/authentication issue\n";
echo "2. Database inconsistency\n";
echo "3. User switching or impersonation\n";
echo "4. Cached authentication data\n";

echo "\n=== DONE ===\n";