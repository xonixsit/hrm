<?php

namespace App\Notifications;

use App\Models\AssessmentCycle;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentCycleCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected AssessmentCycle $cycle;

    /**
     * Create a new notification instance.
     */
    public function __construct(AssessmentCycle $cycle)
    {
        $this->cycle = $cycle;
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
        $completionPercentage = $this->cycle->getCompletionPercentage();
        $totalAssessments = $this->cycle->assessments()->count();
        $completedAssessments = $this->cycle->assessments()->submitted()->count();

        return (new MailMessage)
            ->subject('Assessment Cycle Completed: ' . $this->cycle->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('The competency assessment cycle has been completed.')
            ->line('Cycle: ' . $this->cycle->name)
            ->line('Completion Rate: ' . number_format($completionPercentage, 1) . '%')
            ->line('Completed Assessments: ' . $completedAssessments . ' of ' . $totalAssessments)
            ->line('End Date: ' . $this->cycle->end_date->format('F j, Y'))
            ->action('View Cycle Results', url('/admin/assessment-cycles/' . $this->cycle->id))
            ->line('You can now review the assessment results and generate reports.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assessment_cycle_completed',
            'cycle_id' => $this->cycle->id,
            'cycle_name' => $this->cycle->name,
            'completion_percentage' => $this->cycle->getCompletionPercentage(),
            'total_assessments' => $this->cycle->assessments()->count(),
            'completed_assessments' => $this->cycle->assessments()->submitted()->count(),
            'message' => 'The competency assessment cycle has been completed.'
        ];
    }
}