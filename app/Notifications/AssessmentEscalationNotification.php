<?php

namespace App\Notifications;

use App\Models\CompetencyAssessment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentEscalationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected CompetencyAssessment $assessment;
    protected int $daysOverdue;
    protected string $escalationLevel;

    /**
     * Create a new notification instance.
     */
    public function __construct(CompetencyAssessment $assessment, int $daysOverdue, string $escalationLevel = 'manager')
    {
        $this->assessment = $assessment;
        $this->daysOverdue = $daysOverdue;
        $this->escalationLevel = $escalationLevel;
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
        $subject = $this->escalationLevel === 'hr' ? 
            'ESCALATION: Overdue Assessment Requires Attention' : 
            'Manager Alert: Overdue Assessment';

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('This is an escalation notice regarding an overdue competency assessment.')
            ->line('Assessor: ' . $this->assessment->assessor->name)
            ->line('Employee: ' . $this->assessment->employee->name)
            ->line('Competency: ' . $this->assessment->competency->name)
            ->when($this->assessment->assessmentCycle, function ($mail) {
                return $mail->line('Assessment Cycle: ' . $this->assessment->assessmentCycle->name)
                           ->line('Original Due Date: ' . $this->assessment->assessmentCycle->end_date->format('F j, Y'));
            })
            ->line('Days Overdue: ' . $this->daysOverdue)
            ->when($this->escalationLevel === 'hr', function ($mail) {
                return $mail->line('This assessment has been escalated to HR due to extended delay.')
                           ->line('Please follow up with the assessor and employee to ensure completion.');
            })
            ->when($this->escalationLevel === 'manager', function ($mail) {
                return $mail->line('As the manager, please follow up with the assessor to complete this assessment.');
            })
            ->action('View Assessment', url('/admin/competency-assessments/' . $this->assessment->id))
            ->line('Immediate attention is required to resolve this overdue assessment.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assessment_escalation',
            'assessment_id' => $this->assessment->id,
            'assessor_name' => $this->assessment->assessor->name,
            'employee_name' => $this->assessment->employee->name,
            'competency_name' => $this->assessment->competency->name,
            'cycle_name' => $this->assessment->assessmentCycle?->name,
            'days_overdue' => $this->daysOverdue,
            'escalation_level' => $this->escalationLevel,
            'message' => 'An overdue competency assessment requires immediate attention.'
        ];
    }
}