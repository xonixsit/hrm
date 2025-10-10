<?php

namespace App\Notifications;

use App\Models\CompetencyAssessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected CompetencyAssessment $assessment;

    /**
     * Create a new notification instance.
     */
    public function __construct(CompetencyAssessment $assessment)
    {
        $this->assessment = $assessment;
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
        $daysOverdue = $this->assessment->assessmentCycle ? 
            now()->diffInDays($this->assessment->assessmentCycle->end_date) : 0;

        return (new MailMessage)
            ->subject('Overdue Assessment Reminder')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have an overdue competency assessment that needs your attention.')
            ->line('Employee: ' . $this->assessment->employee->name)
            ->line('Competency: ' . $this->assessment->competency->name)
            ->when($this->assessment->assessmentCycle, function ($mail) use ($daysOverdue) {
                return $mail->line('Assessment Cycle: ' . $this->assessment->assessmentCycle->name)
                           ->line('Days Overdue: ' . $daysOverdue);
            })
            ->action('Complete Assessment', url('/competency-assessments/' . $this->assessment->id))
            ->line('Please complete this assessment as soon as possible.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $daysOverdue = $this->assessment->assessmentCycle ? 
            now()->diffInDays($this->assessment->assessmentCycle->end_date) : 0;

        return [
            'type' => 'assessment_overdue',
            'assessment_id' => $this->assessment->id,
            'employee_name' => $this->assessment->employee->name,
            'competency_name' => $this->assessment->competency->name,
            'cycle_name' => $this->assessment->assessmentCycle?->name,
            'days_overdue' => $daysOverdue,
            'message' => 'You have an overdue competency assessment.'
        ];
    }
}