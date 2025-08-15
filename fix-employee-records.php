<?php

// Fix missing employee records for main users
require_once 'vendor/autoload.php';

try {
    $pdo = new PDO('sqlite:database/database.sqlite');
    echo "✅ Database connection successful\n";
    
    // Get departments for assignment
    $departments = $pdo->query("SELECT id, name FROM departments LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    echo "\n📋 Available departments:\n";
    foreach ($departments as $dept) {
        echo "  - ID: {$dept['id']}, Name: {$dept['name']}\n";
    }
    
    $defaultDeptId = $departments[0]['id'] ?? 1;
    
    // Create employee records for main users
    $mainUsers = [
        ['id' => 1, 'name' => 'Admin User', 'job_title' => 'System Administrator'],
        ['id' => 2, 'name' => 'HR User', 'job_title' => 'HR Manager'],
        ['id' => 3, 'name' => 'Manager User', 'job_title' => 'Department Manager'],
        ['id' => 4, 'name' => 'Employee User', 'job_title' => 'Employee']
    ];
    
    foreach ($mainUsers as $user) {
        // Check if employee record already exists
        $existing = $pdo->prepare("SELECT id FROM employees WHERE user_id = ?");
        $existing->execute([$user['id']]);
        
        if ($existing->fetch()) {
            echo "  ℹ️ Employee record already exists for {$user['name']}\n";
            continue;
        }
        
        // Generate employee code
        $employeeCode = 'EMP' . str_pad($user['id'], 3, '0', STR_PAD_LEFT);
        
        // Insert employee record
        $stmt = $pdo->prepare("
            INSERT INTO employees (
                user_id, employee_code, department_id, job_title, 
                join_date, contract_type, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $user['id'],
            $employeeCode,
            $defaultDeptId,
            $user['job_title'],
            date('Y-m-d'),
            'Full-time',
            'active',
            date('Y-m-d H:i:s'),
            date('Y-m-d H:i:s')
        ]);
        
        if ($result) {
            echo "  ✅ Created employee record for {$user['name']} (Code: {$employeeCode})\n";
        } else {
            echo "  ❌ Failed to create employee record for {$user['name']}\n";
        }
    }
    
    // Verify the fix
    echo "\n🔍 Verification - Users without employee records:\n";
    $usersWithoutEmployees = $pdo->query("
        SELECT u.id, u.name, u.email 
        FROM users u 
        LEFT JOIN employees e ON u.id = e.user_id 
        WHERE e.id IS NULL AND u.id <= 4
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($usersWithoutEmployees)) {
        echo "  ✅ All main users now have employee records!\n";
    } else {
        foreach ($usersWithoutEmployees as $user) {
            echo "  - ID: {$user['id']}, Name: {$user['name']}, Email: {$user['email']}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}