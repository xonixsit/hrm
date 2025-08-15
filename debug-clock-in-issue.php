<?php

// Debug script to check clock in issue
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Check if we can connect to database
try {
    $pdo = new PDO('sqlite:database/database.sqlite');
    echo "✅ Database connection successful\n";
    
    // Check users table
    $users = $pdo->query("SELECT id, name, email FROM users LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    echo "\n📋 Users in database:\n";
    foreach ($users as $user) {
        echo "  - ID: {$user['id']}, Name: {$user['name']}, Email: {$user['email']}\n";
    }
    
    // Check employees table
    $employees = $pdo->query("SELECT id, user_id, first_name, last_name FROM employees LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    echo "\n👥 Employees in database:\n";
    if (empty($employees)) {
        echo "  ❌ No employees found! This is likely the issue.\n";
    } else {
        foreach ($employees as $employee) {
            echo "  - ID: {$employee['id']}, User ID: {$employee['user_id']}, Name: {$employee['first_name']} {$employee['last_name']}\n";
        }
    }
    
    // Check attendances table
    $attendances = $pdo->query("SELECT id, employee_id, date, status FROM attendances ORDER BY date DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    echo "\n⏰ Recent attendances:\n";
    if (empty($attendances)) {
        echo "  ℹ️ No attendance records found.\n";
    } else {
        foreach ($attendances as $attendance) {
            echo "  - ID: {$attendance['id']}, Employee ID: {$attendance['employee_id']}, Date: {$attendance['date']}, Status: {$attendance['status']}\n";
        }
    }
    
    // Check if there are any users without employee records
    $usersWithoutEmployees = $pdo->query("
        SELECT u.id, u.name, u.email 
        FROM users u 
        LEFT JOIN employees e ON u.id = e.user_id 
        WHERE e.id IS NULL
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n🚨 Users without employee records:\n";
    if (empty($usersWithoutEmployees)) {
        echo "  ✅ All users have employee records.\n";
    } else {
        foreach ($usersWithoutEmployees as $user) {
            echo "  - ID: {$user['id']}, Name: {$user['name']}, Email: {$user['email']}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}