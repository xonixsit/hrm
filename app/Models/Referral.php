<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referred_by',
        'candidate_name',
        'candidate_email',
        'candidate_phone',
        'position',
        'department',
        'relationship',
        'note',
        'resume_path',
        'status',
        'reviewed_by',
        'reviewed_at',
        'admin_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'submitted'    => 'Submitted',
            'under_review' => 'Under Review',
            'shortlisted'  => 'Shortlisted',
            'interviewed'  => 'Interviewed',
            'hired'        => 'Hired',
            'rejected'     => 'Rejected',
            default        => ucfirst($this->status),
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'submitted'    => 'blue',
            'under_review' => 'yellow',
            'shortlisted'  => 'purple',
            'interviewed'  => 'indigo',
            'hired'        => 'green',
            'rejected'     => 'red',
            default        => 'gray',
        };
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeByReferrer($query, int $userId)
    {
        return $query->where('referred_by', $userId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
