<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSupportAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-support-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create support@xonixs.com as admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating support admin user...');

        // Create or update the support user
        $supportUser = User::updateOrCreate(
            ['email' => 'support@xonixs.com'],
            [
                'name' => 'Xonixs Support',
                'password' => Hash::make('XonixsSupport2024!'),
                'email_verified_at' => now(),
            ]
        );

        // Assign Admin role
        $supportUser->assignRole('Admin');

        // Create employee record if it doesn't exist
        $departments = Department::all();
        if ($departments->count() > 0) {
            $employee = Employee::firstOrCreate(
                ['user_id' => $supportUser->id],
                [
                    'employee_code' => 'SUP001',
                    'department_id' => $departments->first()->id,
                    'job_title' => 'System Administrator',
                    'join_date' => now(),
                    'contract_type' => 'Permanent',
                    'phone' => '+1-555-SUPPORT',
                    'address' => 'Xonixs Support Office',
                    'status' => 'active',
                ]
            );

            $this->info('✅ Support admin user created successfully!');
            $this->info('📧 Email: support@xonixs.com');
            $this->info('🔑 Password: XonixsSupport2024!');
            $this->info('👤 Role: Admin');
            $this->info('🆔 Employee Code: SUP001');
        } else {
            $this->warn('⚠️  No departments found. Employee record not created.');
            $this->info('✅ Support admin user created successfully!');
            $this->info('📧 Email: support@xonixs.com');
            $this->info('🔑 Password: XonixsSupport2024!');
            $this->info('👤 Role: Admin');
        }

        return Command::SUCCESS;
    }
}