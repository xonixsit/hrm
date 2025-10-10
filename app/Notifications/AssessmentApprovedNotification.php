<?php

namespace App\Notifications;

use App\Models\CompetencyAssessment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected CompetencyAssessment $assessment;
    protected User $approver;

    /**
     * Create a new notification instance.
     */
    public function __construct(CompetencyAssessment $assessment, User $approver)
    {
        $this->assessment = $assessment;
        $this->approver = $approver;
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
            ->subject('Competency Assessment Approved')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your competency assessment has been approved.')
            ->line('Competency: ' . $this->assessment->competency->name)
            ->line('Rating: ' . $this->rating_text())
            ->line('Approved by: ' . $this->approver->name)
            ->when($this->assessment->development_notes, function ($mail) {
                return $mail->line('Notes: ' . $this->assessment->development_notes);
            })
            ->action('View Assessment', url('/competency-assessments/' . $this->assessment->id))
            ->line('Keep up the great work!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assessment_approved',
            'assessment_id' => $this->assessment->id,
            'competency_name' => $this->assessment->competency->name,
            'rating' => $this->assessment->rating,
            'approver_name' => $this->approver->name,
            'message' => 'Your competency assessment has been approved.'
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