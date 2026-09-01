<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhistleblowerReport extends Model
{
    protected $fillable = [
        'reporter_id',
        'category',
        'subject',
        'description',
        'severity',
        'is_anonymous',
        'accused_name',
        'accused_department',
        'attachments',
        'status',
        'admin_notes',
        'assigned_to',
        'reviewed_at',
        'resolved_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'attachments'  => 'array',
        'reviewed_at'  => 'datetime',
        'resolved_at'  => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // ── Static lookups ────────────────────────────────────────────────────────

    public static function categories(): array
    {
        return [
            'harassment'     => 'Harassment or Bullying',
            'fraud'          => 'Fraud or Financial Misconduct',
            'safety'         => 'Safety Violation',
            'discrimination' => 'Discrimination',
            'data_breach'    => 'Data Breach or Privacy Violation',
            'retaliation'    => 'Retaliation',
            'corruption'     => 'Corruption or Bribery',
            'other'          => 'Other',
        ];
    }

    public static function severityLevels(): array
    {
        return [
            'low'      => 'Low',
            'medium'   => 'Medium',
            'high'     => 'High',
            'critical' => 'Critical',
        ];
    }

    public static function statuses(): array
    {
        return [
            'pending'      => 'Pending Review',
            'under_review' => 'Under Review',
            'resolved'     => 'Resolved',
            'dismissed'    => 'Dismissed',
        ];
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getSeverityColorAttribute(): string
    {
        return match ($this->severity) {
            'critical' => 'red',
            'high'     => 'orange',
            'medium'   => 'yellow',
            default    => 'green',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending'      => 'yellow',
            'under_review' => 'blue',
            'resolved'     => 'green',
            'dismissed'    => 'gray',
            default        => 'gray',
        };
    }

    /**
     * For admin view — returns "Anonymous" when reporter chose to hide identity.
     */
    public function getReporterDisplayAttribute(): string
    {
        if ($this->is_anonymous) {
            return 'Anonymous';
        }
        return $this->reporter?->name ?? 'Unknown';
    }
}
