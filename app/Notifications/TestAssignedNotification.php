<?php

namespace App\Notifications;

use App\Models\TestAssignment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TestAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected TestAssignment $assignment;
    protected ?string $notes;

    /**
     * Create a new notification instance.
     */
    public function __construct(TestAssignment $assignment, ?string $notes = null)
    {
        $this->assignment = $assignment;
        $this->notes = $notes;
    }

    /**
     * Get the notification's delivery channels.
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
        $test = $this->assignment->skillTest;
        $deadline = $this->assignment->available_until 
            ? $this->assignment->available_until->format('F j, Y g:i A')
            : 'No deadline';

        $message = (new MailMessage)
            ->subject('New Skill Test Assigned: ' . $test->name)
            ->greeting('Hello ' . $notifiable->first_name . ',')
            ->line('You have been assigned a new skill test.')
            ->line('**Test Name:** ' . $test->name)
            ->line('**Category:** ' . ucfirst($test->category))
            ->line('**Difficulty:** ' . ucfirst($test->difficulty_level))
            ->line('**Passing Score:** ' . $test->passing_score . '%')
            ->line('**Time Limit:** ' . ($test->time_limit ? $test->time_limit . ' minutes' : 'No limit'))
            ->line('**Maximum Attempts:** ' . $this->assignment->max_attempts)
            ->line('**Deadline:** ' . $deadline);

        if ($this->notes) {
            $message->line('**Notes:** ' . $this->notes);
        }

        $message->action('Take Test', url('/skill-tests/' . $test->id . '/take'))
            ->line('Please complete the test before the deadline.')
            ->line('Good luck!');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'test_assigned',
            'test_id' => $this->assignment->skill_test_id,
            'test_name' => $this->assignment->skillTest->name,
            'assignment_id' => $this->assignment->id,
            'deadline' => $this->assignment->available_until,
            'max_attempts' => $this->assignment->max_attempts,
            'notes' => $this->notes,
        ];
    }
}
