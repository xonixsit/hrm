<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeaveRejectedNotification extends Notification
{
    use Queueable;

    private $leave;

    public function __construct($leave)
    {
        $this->leave = $leave;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Leave Request Rejected')
            ->line('Your leave request from ' . $this->leave->from_date . ' to ' . $this->leave->to_date . ' has been rejected.')
            ->action('View Leave', url('/leaves/' . $this->leave->id))
            ->line('Thank you!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Your leave request from ' . $this->leave->from_date . ' to ' . $this->leave->to_date . ' has been rejected.',
            'link' => '/leaves/' . $this->leave->id,
        ];
    }
}
