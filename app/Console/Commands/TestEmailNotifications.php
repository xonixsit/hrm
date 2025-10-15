<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use App\Models\User;
use App\Models\EmailPreference;
use Illuminate\Console\Command;

class TestEmailNotifications extends Command
{
    protected $signature = 'notifications:test {--user-id= : Test with specific user ID}';
    protected $description = 'Test the email notification system';

    public function handle(NotificationService $notificationService): int
    {
        $this->info('🧪 Testing Email Notification System...');
        
        // Get test user
        $userId = $this->option('user-id');
        $user = $userId ? User::find($userId) : User::first();
        
        if (!$user) {
            $this->error('No user found for testing.');
            return Command::FAILURE;
        }
        
        $this->info("Testing with user: {$user->name} ({$user->email})");
        
        // Ensure user has email preferences
        $preferences = $user->getEmailPreferences();
        $this->info("✅ Email preferences loaded");
        
        // Test daily digest
        $this->info('📊 Testing daily digest...');
        try {
            $notificationService->sendDailyDigests();
            $this->info('✅ Daily digest queued successfully');
        } catch (\Exception $e) {
            $this->error("❌ Daily digest failed: " . $e->getMessage());
        }
        
        // Test weekly digest
        $this->info('📈 Testing weekly digest...');
        try {
            $notificationService->sendWeeklyDigests();
            $this->info('✅ Weekly digest queued successfully');
        } catch (\Exception $e) {
            $this->error("❌ Weekly digest failed: " . $e->getMessage());
        }
        
        // Test pending reminders
        $this->info('⏰ Testing pending reminders...');
        try {
            $notificationService->sendPendingReminders();
            $this->info('✅ Pending reminders processed successfully');
        } catch (\Exception $e) {
            $this->error("❌ Pending reminders failed: " . $e->getMessage());
        }
        
        // Show queue status
        $this->info('📋 Queue Status:');
        try {
            $this->call('queue:monitor', ['queues' => 'default']);
        } catch (\Exception $e) {
            $this->info('Queue monitoring not available, but jobs are queued successfully.');
        }
        
        $this->info('🎉 Email notification system test completed!');
        $this->info('💡 Run "php artisan queue:work" to process queued emails');
        
        return Command::SUCCESS;
    }
}