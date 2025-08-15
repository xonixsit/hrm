<?php
// Script to create support user
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    // Create the user account
    $user = User::create([
        'name' => 'Support Team',
        'email' => 'support@xoinxs.com',
        'password' => Hash::make('password123'), // Change this password!
    ]);

    // Create the employee record
    Employee::create([
        'user_id' => $user->id,
        'employee_code' => 'SUP001',
        'department_id' => 337, // Customer Support department
        'job_title' => 'Support Specialist',
        'join_date' => now()->toDateString(),
        'contract_type' => 'Full-time',
        'status' => 'Active',
    ]);

    echo "Support user created successfully!\n";
    echo "Email: support@xoinxs.com\n";
    echo "Password: password123 (please change this!)\n";
});