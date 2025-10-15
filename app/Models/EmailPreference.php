<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'leave_request_submitted',
        'leave_request_approved',
        'leave_request_rejected',
        'assessment_assigned',
        'assessment_submitted',
        'assessment_approved',
        'assessment_rejected',
        'daily_digest',
        'weekly_digest',
        'digest_time',
        'digest_day',
        'pending_reminders',
        'reminder_frequency_hours',
        'system_notifications',
        'marketing_emails',
        'birthday_notifications',
        'birthday_reminders',
        'birthday_reminder_days',
    ];

    protected $casts = [
        'leave_request_submitted' => 'boolean',
        'leave_request_approved' => 'boolean',
        'leave_request_rejected' => 'boolean',
        'assessment_assigned' => 'boolean',
        'assessment_submitted' => 'boolean',
        'assessment_approved' => 'boolean',
        'assessment_rejected' => 'boolean',
        'daily_digest' => 'boolean',
        'weekly_digest' => 'boolean',
        'pending_reminders' => 'boolean',
        'system_notifications' => 'boolean',
        'marketing_emails' => 'boolean',
        'birthday_notifications' => 'boolean',
        'birthday_reminders' => 'boolean',
        'reminder_frequency_hours' => 'integer',
        'birthday_reminder_days' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create email preferences for a user
     */
    public static function getForUser(User $user): self
    {
        return self::firstOrCreate(
            ['user_id' => $user->id],
            [
                'leave_request_submitted' => true,
                'leave_request_approved' => true,
                'leave_request_rejected' => true,
                'assessment_assigned' => true,
                'assessment_submitted' => true,
                'assessment_approved' => true,
                'assessment_rejected' => true,
                'daily_digest' => false,
                'weekly_digest' => true,
                'digest_time' => '09:00',
                'digest_day' => 'monday',
                'pending_reminders' => true,
                'reminder_frequency_hours' => 24,
                'system_notifications' => true,
                'marketing_emails' => false,
                'birthday_notifications' => true,
                'birthday_reminders' => true,
                'birthday_reminder_days' => 3,
            ]
        );
    }

    /**
     * Check if user wants to receive a specific notification type
     */
    public function wantsNotification(string $type): bool
    {
        return $this->getAttribute($type) ?? false;
    }
}