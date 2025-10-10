<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Employee;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or find the Admin role
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        // Create the admin user
        $user = User::firstOrCreate(
            ['email' => 'support@xonixs.com'],
            [
                'name' => 'Support Admin',
                'email' => 'support@xonixs.com',
                'password' => Hash::make('password123'), // Change this to a secure password
                'email_verified_at' => now(),
            ]
        );

        // Assign Admin role to the user
        if (!$user->hasRole('Admin')) {
            $user->assignRole('Admin');
        }

        // Create an employee record for the admin user if it doesn't exist
        $employee = Employee::firstOrCreate(
            ['user_id' => $user->id],
            [
                'user_id' => $user->id,
                'employee_code' => 'ADMIN001',
                'department_id' => null, // You can set this to a specific department if needed
                'position' => 'System Administrator',
                'hire_date' => now(),
                'salary' => 0,
                'status' => 'active',
            ]
        );

        $this->command->info('Admin user created successfully:');
        $this->command->info('Email: support@xonixs.com');
        $this->command->info('Password: password123');
        $this->command->info('Role: Admin');
    }
}