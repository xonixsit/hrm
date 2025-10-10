<?php

namespace App\Notifications;

use App\Models\CompetencyAssessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected CompetencyAssessment $assessment;
    protected int $daysRemaining;

    /**
     * Create a new notification instance.
     */
    public function __construct(CompetencyAssessment $assessment, int $daysRemaining)
    {
        $this->assessment = $assessment;
        $this->daysRemaining = $daysRemaining;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $urgencyLevel = $this->getUrgencyLevel();
        $subject = $urgencyLevel === 'urgent' ? 
            'URGENT: Assessment Due Soon' : 
            'Reminder: Competency Assessment Due';

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('This is a reminder about your pending competency assessment.')
            ->line('Employee: ' . $this->assessment->employee->name)
            ->line('Competency: ' . $this->assessment->competency->name)
            ->when($this->assessment->assessmentCycle, function ($mail) {
                return $mail->line('Assessment Cycle: ' . $this->assessment->assessmentCycle->name)
                           ->line('Due Date: ' . $this->assessment->assessmentCycle->end_date->format('F j, Y'));
            })
            ->line('Days Remaining: ' . $this->daysRemaining)
            ->when($urgencyLevel === 'urgent', function ($mail) {
                return $mail->line('⚠️ This assessment is due very soon. Please complete it as soon as possible.');
            })
            ->action('Complete Assessment', url('/competency-assessments/' . $this->assessment->id))
            ->line('Thank you for your attention to this matter.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assessment_reminder',
            'assessment_id' => $this->assessment->id,
            'employee_name' => $this->assessment->employee->name,
            'competency_name' => $this->assessment->competency->name,
            'cycle_name' => $this->assessment->assessmentCycle?->name,
            'days_remaining' => $this->daysRemaining,
            'urgency_level' => $this->getUrgencyLevel(),
            'message' => 'Reminder: You have a pending competency assessment.'
        ];
    }

    /**
     * Get the urgency level based on days remaining.
     */
    private function getUrgencyLevel(): string
    {
        if ($this->daysRemaining <= 1) {
            return 'urgent';
        } elseif ($this->daysRemaining <= 3) {
            return 'high';
        } else {
            return 'normal';
        }
    }
}