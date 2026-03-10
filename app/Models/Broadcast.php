<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Broadcast extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'created_by',
        'title',
        'content',
        'type',
        'email_template',
        'status',
        'scheduled_at',
        'sent_at',
        'recipients_count',
        'sent_count',
        'failed_count',
        'recipient_filters',
        'attachments',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'recipient_filters' => 'array',
        'attachments' => 'array',
    ];

    /**
     * Get the user who created this broadcast.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the recipients of this broadcast.
     */
    public function recipients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'broadcast_recipients')
            ->withPivot('status', 'error_message', 'sent_at')
            ->withTimestamps();
    }

    /**
     * Get the list of recipients based on filters.
     */
    public function getRecipientsList()
    {
        $query = User::query();

        if ($this->recipient_filters) {
            $filters = $this->recipient_filters;

            // Filter by roles
            if (!empty($filters['roles'])) {
                $query->whereHas('roles', function ($q) use ($filters) {
                    $q->whereIn('name', $filters['roles']);
                });
            }

            // Filter by departments
            if (!empty($filters['departments'])) {
                $query->whereHas('employee', function ($q) use ($filters) {
                    $q->whereIn('department_id', $filters['departments']);
                });
            }

            // Filter by status
            if (!empty($filters['status'])) {
                $query->whereHas('employee', function ($q) use ($filters) {
                    $q->where('status', $filters['status']);
                });
            }
        }

        return $query->get();
    }

    /**
     * Scope to get only sent broadcasts.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope to get only scheduled broadcasts.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope to get only draft broadcasts.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Check if broadcast is sent.
     */
    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Check if broadcast is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if broadcast is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }
}
