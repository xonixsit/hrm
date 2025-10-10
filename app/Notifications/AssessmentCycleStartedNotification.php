<?php

namespace App\Notifications;

use App\Models\AssessmentCycle;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentCycleStartedNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('New Assessment Cycle Started: ' . $this->cycle->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new competency assessment cycle has started.')
            ->line('Cycle: ' . $this->cycle->name)
            ->line('Description: ' . $this->cycle->description)
            ->line('End Date: ' . $this->cycle->end_date->format('F j, Y'))
            ->line('Assessment Types: ' . implode(', ', $this->cycle->assessment_types))
            ->action('View Assessments', url('/competency-assessments?cycle=' . $this->cycle->id))
            ->line('Please complete your assessments before the deadline.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assessment_cycle_started',
            'cycle_id' => $this->cycle->id,
            'cycle_name' => $this->cycle->name,
            'end_date' => $this->cycle->end_date->toDateString(),
            'assessment_types' => $this->cycle->assessment_types,
            'message' => 'A new competency assessment cycle has started.'
        ];
    }
}