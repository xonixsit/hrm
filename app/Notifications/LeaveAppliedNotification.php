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
        $this->leave = $leave;
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
        $employeeName = $this->leave->employee->first_name . ' ' . $this->leave->employee->last_name;
        $leaveUrl = url('/leaves/' . $this->leave->id);

        return (new MailMessage)
            ->subject('New Leave Application')
            ->greeting('Hello!')
            ->line($employeeName . ' has applied for a new leave.')
            ->line('Leave Type: ' . $this->leave->leaveType->name)
            ->line('Dates: ' . $this->leave->from_date . ' to ' . $this->leave->to_date)
            ->line('Reason: ' . $this->leave->reason)
            ->action('View Leave Request', $leaveUrl)
            ->salutation(new HtmlString('Regards,<br>E-Tax Planner'));
    }
}