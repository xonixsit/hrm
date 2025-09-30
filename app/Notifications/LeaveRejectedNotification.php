<?php

namespace App\Notifications;

use App\Models\Leave;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class LeaveRejectedNotification extends Notification implements ShouldQueue
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
        $this->leave = $leave->load(['employee.user', 'leaveType', 'approver']);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
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
        $approverName = $this->leave->approver->name ?? 'Admin';

        return (new MailMessage)
            ->subject('Leave Request Rejected')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('We regret to inform you that your leave request has been rejected.')
            ->line('Leave Type: ' . ($this->leave->leaveType->name ?? 'N/A'))
            ->line('Dates: ' . $this->leave->from_date->format('M d, Y') . ' to ' . $this->leave->to_date->format('M d, Y'))
            ->line('Rejected by: ' . $approverName)
            ->when($this->leave->approval_comments, function ($mail) {
                return $mail->line('Reason: ' . $this->leave->approval_comments);
            })
            ->action('View Leave Details', $leaveUrl)
            ->line('If you have any questions, please contact HR.')
            ->salutation(new HtmlString('Regards,<br>E-Tax Planner'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'message' => 'Your leave request from ' . $this->leave->from_date->format('M d, Y') . ' to ' . $this->leave->to_date->format('M d, Y') . ' has been rejected.',
            'link' => '/leaves/' . $this->leave->id,
            'leave_id' => $this->leave->id,
            'status' => 'rejected',
        ];
    }
}
