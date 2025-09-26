<?php

namespace App\Notifications;

use App\Models\Timesheet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TimesheetRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $timesheet;

    /**
     * Create a new notification instance.
     */
    public function __construct(Timesheet $timesheet)
    {
        $this->timesheet = $timesheet;
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
            ->subject('Timesheet Rejected')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your timesheet for ' . ($this->timesheet->date ? $this->timesheet->date->format('F j, Y') : 'unknown date') . ' has been rejected.')
            ->line('Project: ' . ($this->timesheet->project->name ?? 'N/A'))
            ->line('Hours: ' . $this->timesheet->hours)
            ->line('Reason: ' . ($this->timesheet->approval_comments ?? 'No reason provided'))
            ->line('Please review the feedback and resubmit your timesheet if necessary.')
            ->action('View Timesheet', route('timesheets.show', $this->timesheet->id))
            ->line('If you have any questions, please contact your manager.')
            ->salutation('Regards,\nE-Tax Planner');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'timesheet_rejected',
            'timesheet_id' => $this->timesheet->id,
            'date' => $this->timesheet->date ? $this->timesheet->date->format('Y-m-d') : null,
            'hours' => $this->timesheet->hours,
            'project' => $this->timesheet->project->name ?? 'N/A',
            'rejected_by' => $this->timesheet->approver->name ?? 'System',
            'rejection_reason' => $this->timesheet->approval_comments,
            'message' => 'Your timesheet for ' . ($this->timesheet->date ? $this->timesheet->date->format('F j, Y') : 'unknown date') . ' has been rejected.'
        ];
    }
}