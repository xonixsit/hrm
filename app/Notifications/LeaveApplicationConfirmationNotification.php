<?php

namespace App\Notifications;

use App\Models\Leave;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class LeaveApplicationConfirmationNotification extends Notification implements ShouldQueue
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
        $leaveUrl = url('/leaves/' . $this->leave->id);

        return (new MailMessage)
            ->subject('Leave Application Submitted Successfully')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your leave application has been submitted successfully and is pending approval.')
            ->line('Leave Type: ' . ($this->leave->leaveType->name ?? 'N/A'))
            ->line('Dates: ' . $this->leave->from_date->format('M d, Y') . ' to ' . $this->leave->to_date->format('M d, Y'))
            ->line('Reason: ' . ($this->leave->reason ?? 'No reason provided'))
            ->line('You will be notified once your leave request is reviewed.')
            ->action('View Leave Request', $leaveUrl)
            ->salutation(new HtmlString('Regards,<br>Xonobics'));
    }
}