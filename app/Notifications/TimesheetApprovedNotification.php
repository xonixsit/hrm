<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TimesheetApprovedNotification extends Notification
{
    use Queueable;

    private $timesheet;

    public function __construct($timesheet)
    {
        $this->timesheet = $timesheet;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Timesheet Approved')
            ->line('Your timesheet for date ' . $this->timesheet->date . ' with ' . $this->timesheet->hours . ' hours has been approved.')
            ->action('View Timesheet', url('/timesheets/' . $this->timesheet->id))
            ->line('Thank you!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Your timesheet for date ' . $this->timesheet->date . ' with ' . $this->timesheet->hours . ' hours has been approved.',
            'link' => '/timesheets/' . $this->timesheet->id,
        ];
    }
}
