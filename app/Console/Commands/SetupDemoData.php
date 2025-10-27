<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SetupDemoData extends Command
{
    protected $signature = 'demo:setup {--fresh : Run fresh migration before seeding}';
    protected $description = 'Set up demo data for staging environment';

    public function handle()
    {
        $this->info('🚀 Setting up demo data for Xonixs HRM...');
        
        if ($this->option('fresh')) {
            $this->info('📦 Running fresh migrations...');
            Artisan::call('migrate:fresh', ['--force' => true]);
            $this->info(Artisan::output());
        } else {
            $this->info('📦 Running migrations...');
            Artisan::call('migrate', ['--force' => true]);
            $this->info(Artisan::output());
        }
        
        $this->info('🌱 Seeding demo data...');
        Artisan::call('db:seed', ['--class' => 'DemoDataSeeder']);
        $this->info(Artisan::output());
        
        $this->info('✅ Demo setup completed successfully!');
        $this->newLine();
        
        $this->info('🔑 Demo Login Credentials:');
        $this->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@xonixs.com', 'password123'],
                ['HR Manager', 'hr@xonixs.com', 'password123'],
                ['IT Manager', 'manager@xonixs.com', 'password123'],
                ['Employee', 'employee@xonixs.com', 'password123'],
            ]
        );
        
        $this->newLine();
        $this->info('📊 Demo Data Includes:');
        $this->line('• 11 Users (1 Admin, 1 HR, 1 Manager, 8 Employees)');
        $this->line('• 5 Departments with realistic structure');
        $this->line('• 4 Active projects');
        $this->line('• 4 Leave types with quotas');
        $this->line('• 5 Competency categories');
        $this->line('• 2 Active assessment cycles');
        $this->line('• 30 days of attendance records');
        $this->line('• 20 days of timesheet entries');
        $this->line('• 15 days of work reports');
        $this->line('• Multiple leave requests (pending/approved/rejected)');
        $this->line('• Competency assessments with ratings');
        $this->line('• Peer feedback entries');
        
        $this->newLine();
        $this->info('🎯 Ready for demo! Visit your application and login with any of the above credentials.');
        
        return 0;
    }
}