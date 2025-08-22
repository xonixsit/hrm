<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            DepartmentSeeder::class,
            DemoDataSeeder::class,

        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => Hash::make('password')]
        );
        $admin->assignRole('Admin');

        $hr = User::firstOrCreate(
            ['email' => 'hr@example.com'],
            ['name' => 'HR User', 'password' => Hash::make('password')]
        );
        $hr->assignRole('HR');

        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            ['name' => 'Manager User', 'password' => Hash::make('password')]
        );
        $manager->assignRole('Manager');

        $employee = User::firstOrCreate(
            ['email' => 'employee@example.com'],
            ['name' => 'Employee User', 'password' => Hash::make('password')]
        );
        $employee->assignRole('Employee');

        $supportUser = User::firstOrCreate(
            ['email' => 'support@xonixs.com'],
            ['name' => 'Support Xonixs', 'password' => Hash::make('password')]
        );
        $supportUser->assignRole('Admin');

        $this->call(DepartmentSeeder::class);

        $departmentIds = \App\Models\Department::pluck('id')->toArray();

        \App\Models\Employee::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'employee_code' => 'EMP001',
                'department_id' => $departmentIds[array_rand($departmentIds)],
                'job_title' => 'Administrator',
                'join_date' => now()->subYears(1),
                'contract_type' => 'Permanent',
                'phone' => '1234567890',
                'address' => 'Admin Address',
                'status' => 'active',
            ]
        );

        \App\Models\Employee::firstOrCreate(
            ['user_id' => $hr->id],
            [
                'employee_code' => 'EMP002',
                'department_id' => $departmentIds[array_rand($departmentIds)],
                'job_title' => 'HR Manager',
                'join_date' => now()->subYears(1),
                'contract_type' => 'Permanent',
                'phone' => '1234567891',
                'address' => 'HR Address',
                'status' => 'active',
            ]
        );

        \App\Models\Employee::firstOrCreate(
            ['user_id' => $manager->id],
            [
                'employee_code' => 'EMP003',
                'department_id' => $departmentIds[array_rand($departmentIds)],
                'job_title' => 'Team Manager',
                'join_date' => now()->subYears(1),
                'contract_type' => 'Permanent',
                'phone' => '1234567892',
                'address' => 'Manager Address',
                'status' => 'active',
            ]
        );

        \App\Models\Employee::firstOrCreate(
            ['user_id' => $employee->id],
            [
                'employee_code' => 'EMP004',
                'department_id' => $departmentIds[array_rand($departmentIds)],
                'job_title' => 'Staff',
                'join_date' => now()->subYears(1),
                'contract_type' => 'Permanent',
                'phone' => '1234567893',
                'address' => 'Employee Address',
                'status' => 'active',
            ]
        );

        $this->call(DemoDataSeeder::class);
    }
}
