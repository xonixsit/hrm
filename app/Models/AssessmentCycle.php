<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentCycle extends Model
{
    protected static function boot()
    {
        parent::boot();
        
        // Ensure is_active is always in sync with status
        static::saving(function ($model) {
            $model->is_active = ($model->status === 'active');
        });
    }

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'status',
        'is_active',
        'assessment_types',
        'target_employees',
        'notification_settings',
        'created_by'
    ];

    protected $casts = [
        'assessment_types' => 'array',
        'target_employees' => 'array',
        'notification_settings' => 'array',
        'start_date' => 'date',
        'end_date' => 'date'
    ];

    /**
     * Get the user who created this assessment cycle.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the assessments for this cycle.
     */
    public function assessments(): HasMany
    {
        return $this->hasMany(CompetencyAssessment::class);
    }

    /**
     * Scope to get active cycles.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Set the status attribute and sync is_active.
     */
    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = $value;
        $this->attributes['is_active'] = ($value === 'active');
    }

    /**
     * Scope to get completed cycles.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get cycles by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Check if the cycle is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && 
               now()->between($this->start_date, $this->end_date);
    }

    /**
     * Check if the cycle is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the cycle is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === 'active' && now()->gt($this->end_date);
    }

    /**
     * Get the completion percentage of the cycle.
     */
    public function getCompletionPercentage(): float
    {
        $totalAssessments = $this->assessments()->count();
        if ($totalAssessments === 0) {
            return 0;
        }

        $completedAssessments = $this->assessments()->submitted()->count();
        return ($completedAssessments / $totalAssessments) * 100;
    }

    /**
     * Check if the cycle is planned.
     */
    public function isPlanned(): bool
    {
        return $this->status === 'planned';
    }

    /**
     * Check if the cycle is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Start the assessment cycle.
     */
    public function start(bool $adminOverride = false): bool
    {
        if ($this->isPlanned() && ($adminOverride || now()->gte($this->start_date))) {
            $this->status = 'active';
            return $this->save();
        }
        return false;
    }

    /**
     * Complete the assessment cycle.
     */
    public function complete(): bool
    {
        if ($this->isActive()) {
            $this->status = 'completed';
            return $this->save();
        }
        return false;
    }

    /**
     * Cancel the assessment cycle.
     */
    public function cancel(): bool
    {
        if ($this->isPlanned() || $this->isActive()) {
            $this->status = 'cancelled';
            return $this->save();
        }
        return false;
    }

    /**
     * Get validation rules for the assessment cycle.
     */
    public static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'status' => 'in:planned,active,completed,cancelled',
            'assessment_types' => 'required|array|min:1',
            'assessment_types.*' => 'in:self,manager,peer,360',
            'target_employees' => 'nullable|array',
            'target_employees.*' => 'exists:employees,id',
            'notification_settings' => 'nullable|array',
            'created_by' => 'required|exists:users,id'
        ];
    }

    /**
     * Get the days remaining in the cycle.
     */
    public function getDaysRemaining(): int
    {
        if ($this->isCompleted() || $this->isCancelled()) {
            return 0;
        }

        $daysRemaining = now()->diffInDays($this->end_date, false);
        return max(0, $daysRemaining);
    }

    /**
     * Get pending assessments count.
     */
    public function getPendingAssessmentsCount(): int
    {
        return $this->assessments()->where('status', 'draft')->count();
    }

    /**
     * Get submitted assessments count.
     */
    public function getSubmittedAssessmentsCount(): int
    {
        return $this->assessments()->where('status', 'submitted')->count();
    }

    /**
     * Check if the cycle can be started.
     */
    public function canStart(bool $adminOverride = false): bool
    {
        if (!$this->isPlanned()) {
            return false;
        }
        
        // Allow admin override for future start dates
        if ($adminOverride) {
            return true;
        }
        
        return now()->gte($this->start_date);
    }

    /**
     * Check if the cycle can be completed.
     */
    public function canComplete(): bool
    {
        return $this->isActive() && $this->getCompletionPercentage() >= 100;
    }

    /**
     * Get the total number of assessments in this cycle.
     */
    public function getTotalAssessmentsCount(): int
    {
        return $this->assessments()->count();
    }

    /**
     * Get the approved assessments count.
     */
    public function getApprovedAssessmentsCount(): int
    {
        return $this->assessments()->where('status', 'approved')->count();
    }

    /**
     * Get overdue assessments for this cycle.
     */
    public function getOverdueAssessments()
    {
        if (!$this->isOverdue()) {
            return collect();
        }

        return $this->assessments()
            ->where('status', 'draft')
            ->with(['employee.user', 'competency', 'assessor'])
            ->get();
    }
}