<?php

namespace App\Notifications;

use App\Models\CompetencyAssessment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected CompetencyAssessment $assessment;
    protected User $rejector;
    protected string $rejectionReason;

    /**
     * Create a new notification instance.
     */
    public function __construct(CompetencyAssessment $assessment, User $rejector, string $rejectionReason)
    {
        $this->assessment = $assessment;
        $this->rejector = $rejector;
        $this->rejectionReason = $rejectionReason;
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
            ->subject('Competency Assessment Requires Revision')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your competency assessment requires revision.')
            ->line('Competency: ' . $this->assessment->competency->name)
            ->line('Rating: ' . $this->rating_text())
            ->line('Reviewed by: ' . $this->rejector->name)
            ->line('Reason for revision: ' . $this->rejectionReason)
            ->action('Revise Assessment', url('/competency-assessments/' . $this->assessment->id . '/edit'))
            ->line('Please review the feedback and resubmit your assessment.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assessment_rejected',
            'assessment_id' => $this->assessment->id,
            'competency_name' => $this->assessment->competency->name,
            'rating' => $this->assessment->rating,
            'rejector_name' => $this->rejector->name,
            'rejection_reason' => $this->rejectionReason,
            'message' => 'Your competency assessment requires revision.'
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