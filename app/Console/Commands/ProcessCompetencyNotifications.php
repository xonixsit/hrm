<?php

namespace App\Console\Commands;

use App\Services\CompetencyAssessmentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessCompetencyNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'competency:process-notifications 
                            {--type=all : Type of notifications to process (all, reminders, overdue, escalations)}
                            {--dry-run : Show what would be processed without sending notifications}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process automated competency assessment notifications including reminders, overdue alerts, and escalations';

    protected ?CompetencyAssessmentService $assessmentService = null;

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->assessmentService = app(CompetencyAssessmentService::class);
        
        $type = $this->option('type');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No notifications will be sent');
        }

        $this->info('🚀 Starting competency notification processing...');
        
        try {
            // Get current statistics
            $stats = $this->getNotificationStats();
            $this->displayStats($stats);

            if ($dryRun) {
                $this->info('✅ Dry run completed. No notifications were sent.');
                return Command::SUCCESS;
            }

            // Process notifications based on type
            switch ($type) {
                case 'reminders':
                    $this->processReminders();
                    break;
                case 'overdue':
                    $this->processOverdue();
                    break;
                case 'escalations':
                    $this->processEscalations();
                    break;
                case 'all':
                default:
                    $this->processAll();
                    break;
            }

            $this->info('✅ Notification processing completed successfully.');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Error processing notifications: ' . $e->getMessage());
            Log::error('Competency notification command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Process all notification types.
     */
    private function processAll(): void
    {
        $this->info('📧 Processing all notification types...');
        $this->assessmentService->processAutomatedNotifications();
    }

    /**
     * Process reminder notifications only.
     */
    private function processReminders(): void
    {
        $this->info('⏰ Processing reminder notifications...');
        $this->assessmentService->sendAssessmentReminders();
    }

    /**
     * Process overdue notifications only.
     */
    private function processOverdue(): void
    {
        $this->info('⚠️ Processing overdue notifications...');
        $this->assessmentService->sendOverdueReminders();
    }

    /**
     * Process escalation notifications only.
     */
    private function processEscalations(): void
    {
        $this->info('🚨 Processing escalation notifications...');
        $this->assessmentService->sendEscalationNotifications();
    }

    /**
     * Get notification statistics for reporting.
     */
    private function getNotificationStats(): array
    {
        try {
            return [
                'pending_assessments' => \App\Models\CompetencyAssessment::where('status', 'draft')->count(),
                'overdue_assessments' => $this->getOverdueAssessmentsCount(),
                'active_cycles' => \App\Models\AssessmentCycle::active()->count(),
                'completed_cycles_today' => \App\Models\AssessmentCycle::completed()
                    ->whereDate('updated_at', today())
                    ->count(),
                'notifications_sent_today' => $this->getNotificationsSentToday()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get notification statistics', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get count of overdue assessments.
     */
    private function getOverdueAssessmentsCount(): int
    {
        return \App\Models\CompetencyAssessment::where('status', 'draft')
            ->whereHas('assessmentCycle', function ($query) {
                $query->where('end_date', '<', now())
                      ->where('status', 'active');
            })
            ->count();
    }

    /**
     * Get count of notifications sent today.
     */
    private function getNotificationsSentToday(): int
    {
        return \DB::table('notifications')
            ->whereDate('created_at', today())
            ->whereIn('type', [
                'App\\Notifications\\AssessmentCycleStartedNotification',
                'App\\Notifications\\AssessmentCycleCompletedNotification',
                'App\\Notifications\\AssessmentOverdueNotification',
                'App\\Notifications\\AssessmentReminderNotification',
                'App\\Notifications\\AssessmentEscalationNotification',
                'App\\Notifications\\AssessmentSubmittedNotification',
                'App\\Notifications\\AssessmentApprovedNotification',
                'App\\Notifications\\AssessmentRejectedNotification'
            ])
            ->count();
    }

    /**
     * Display current notification statistics.
     */
    private function displayStats(array $stats): void
    {
        $this->info('📊 Current Statistics:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Pending Assessments', $stats['pending_assessments'] ?? 0],
                ['Overdue Assessments', $stats['overdue_assessments'] ?? 0],
                ['Active Cycles', $stats['active_cycles'] ?? 0],
                ['Cycles Completed Today', $stats['completed_cycles_today'] ?? 0],
                ['Notifications Sent Today', $stats['notifications_sent_today'] ?? 0],
            ]
        );
    }
}
