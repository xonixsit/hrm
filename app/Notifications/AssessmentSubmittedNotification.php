<?php

namespace App\Notifications;

use App\Models\CompetencyAssessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentSubmittedNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('Competency Assessment Submitted')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A competency assessment has been submitted for your review.')
            ->line('Employee: ' . $this->assessment->employee->name)
            ->line('Competency: ' . $this->assessment->competency->name)
            ->line('Rating: ' . $this->rating_text())
            ->action('Review Assessment', url('/admin/competency-assessments/' . $this->assessment->id))
            ->line('Please review and approve or reject this assessment.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assessment_submitted',
            'assessment_id' => $this->assessment->id,
            'employee_name' => $this->assessment->employee->name,
            'competency_name' => $this->assessment->competency->name,
            'rating' => $this->assessment->rating,
            'assessor_name' => $this->assessment->assessor->name,
            'message' => 'A competency assessment has been submitted for review.'
        ];
    }

    /**
     * Get rating text representation.
     */
    private function rating_text(): string
    {
        $ratings = [
            1 => 'Poor',
            2 => 'Needs Improvement',
            3 => 'Meets Expectations',
            4 => 'Exceeds Expectations',
            5 => 'Outstanding'
        ];

        return $ratings[$this->assessment->rating] ?? 'Unknown';
    }
}