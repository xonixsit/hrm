<?php

namespace App\Notifications;

use App\Models\Leave;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class LeaveAppliedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $leave;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Leave $leave)
    {
        // Eager load the necessary relationships to avoid N+1 queries
        $this->leave = $leave->load(['employee.user', 'leaveType']);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        // Get employee name from the user relationship
        $employeeName = $this->leave->employee->user->name ?? 'Unknown Employee';
        $leaveUrl = url('/leaves/' . $this->leave->id);

        return (new MailMessage)
            ->subject('New Leave Application')
            ->greeting('Hello!')
            ->line($employeeName . ' has applied for a new leave.')
            ->line('Leave Type: ' . ($this->leave->leaveType->name ?? 'N/A'))
            ->line('Dates: ' . $this->leave->from_date->format('M d, Y') . ' to ' . $this->leave->to_date->format('M d, Y'))
            ->line('Reason: ' . ($this->leave->reason ?? 'No reason provided'))
            ->action('View Leave Request', $leaveUrl)
            ->salutation(new HtmlString('Regards,<br>Xonobics'));
    }
}