<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Employee;

class WelcomeEmployeeNotification extends Notification implements ShouldQueue
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
            ->subject('Welcome to ' . config('app.name', 'XonixSHR'))
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Welcome to our team! We are excited to have you join us.')
            ->line('Your employee account has been created with the following details:')
            ->line('Job Title: ' . $this->employee->job_title)
            ->line('Department: ' . ($this->employee->department->name ?? 'Not assigned'))
            ->line('Employee Code: ' . $this->employee->employee_code)
            ->line('Join Date: ' . $this->employee->join_date->format('F j, Y'))
            ->action('Login to Your Account', route('login'))
            ->line('If you have any questions, please contact your manager or the HR department.')
            ->line('We look forward to working with you!');
    }
}