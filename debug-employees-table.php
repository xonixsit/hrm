<?php

// Debug script to check employees table structure
try {
    $pdo = new PDO('sqlite:database/database.sqlite');
    echo "✅ Database connection successful\n";
    
    // Get table structure
    $columns = $pdo->query("PRAGMA table_info(employees)")->fetchAll(PDO::FETCH_ASSOC);
    echo "\n📋 Employees table structure:\n";
    foreach ($columns as $column) {
        echo "  - {$column['name']} ({$column['type']}) - " . ($column['notnull'] ? 'NOT NULL' : 'NULL') . "\n";
    }
    
    // Check employees table with correct columns
    $employees = $pdo->query("SELECT * FROM employees LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    echo "\n👥 Employees in database:\n";
    if (empty($employees)) {
        echo "  ❌ No employees found! This is likely the issue.\n";
    } else {
        foreach ($employees as $employee) {
            echo "  - Employee: " . json_encode($employee) . "\n";
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