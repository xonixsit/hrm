<?php

namespace App\Services;

class CompetencyNotificationService
{
    public function getNotificationStats(): array
    {
        return [
            'pending_assessments' => 0,
            'overdue_assessments' => 0,
            'active_cycles' => 0,
            'completed_cycles_today' => 0,
            'notifications_sent_today' => 0
        ];
    }

    public function processAutomatedNotifications(): void
    {
        // Basic implementation
    }

    public function sendAssessmentReminders(): void
    {
        // Basic implementation
    }

    public function sendOverdueNotifications(): void
    {
        // Basic implementation
    }

    public function sendEscalationNotifications(): void
    {
        // Basic implementation
    }
}