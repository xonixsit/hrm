<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Employee;

class WelcomeEmployeeNotification extends Notification
{
    use Queueable;

    protected $employee;

    /**
     * Create a new notification instance.
     */
    public function __construct(Employee $employee)
    {
        $this->employee = $employee;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to ' . config('app.name', 'E-Tax Planner'))
            ->greeting('Hello ' . $notifiable->name . '!')
            // Add BCC to sender mailbox for delivery confirmation
            ->bcc(config('mail.from.address'), config('mail.from.name'))
            // Ensure replies go to sender mailbox
            ->replyTo(config('mail.from.address'), config('mail.from.name'))
            ->line('Welcome to our team! We are excited to have you join us.')
            ->line('Your employee account has been created with the following details:')
            ->line('Job Title: ' . $this->employee->job_title)
            // Safely access department name if relationship is not loaded
            ->line('Department: ' . ($this->employee->department?->name ?? 'Not assigned'))
            // Guard join_date formatting
            ->line('Join Date: ' . ($this->employee->join_date ? $this->employee->join_date->format('F j, Y') : 'N/A'))
            ->action('Login to Your Account', route('login'))
            ->line('If you have any questions, please contact your manager or the HR department.')
            ->line('We look forward to working with you!')
            ->salutation('Regards,\nE-Tax Planner');
    }
}