<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'subject',
        'description',
        'priority',
        'status',
        'attachments',
        'resolved_at',
        'admin_notes',
    ];

    protected $casts = [
        'attachments' => 'json',
        'resolved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getCategories(): array
    {
        return [
            'technical' => 'Technical Issues',
            'account' => 'Account & Login',
            'attendance' => 'Attendance & Time Tracking',
            'leave' => 'Leave Management',
            'assessment' => 'Competency Assessments',
            'reports' => 'Reports & Analytics',
            'permissions' => 'Permissions & Access',
            'general' => 'General Help',
            'other' => 'Other',
        ];
    }

    public static function getPriorities(): array
    {
        return [
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
        ];
    }

    public static function getStatuses(): array
    {
        return [
            'open' => 'Open',
            'in_progress' => 'In Progress',
            'resolved' => 'Resolved',
            'closed' => 'Closed',
        ];
    }

    public function getCategoryLabelAttribute(): string
    {
        return self::getCategories()[$this->category] ?? $this->category;
    }

    public function getPriorityLabelAttribute(): string
    {
        return self::getPriorities()[$this->priority] ?? $this->priority;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::getStatuses()[$this->status] ?? $this->status;
    }
}
