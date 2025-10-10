<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetencyAssessment extends Model
{
    protected $fillable = [
        'employee_id',
        'competency_id',
        'assessor_id',
        'assessment_cycle_id',
        'rating',
        'comments',
        'assessment_type',
        'status',
        'submitted_at',
        'evidence_files',
        'development_notes',
        'extended_deadline',
        'approved_at',
        'rejected_at',
        'approved_by',
        'rejected_by',
        'rejection_reason'
    ];

    protected $casts = [
        'evidence_files' => 'array',
        'submitted_at' => 'datetime',
        'extended_deadline' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'rating' => 'integer'
    ];

    /**
     * Get the employee being assessed.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the competency being assessed.
     */
    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }

    /**
     * Get the user who performed the assessment.
     */
    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    /**
     * Get the assessment cycle this assessment belongs to.
     */
    public function assessmentCycle(): BelongsTo
    {
        return $this->belongsTo(AssessmentCycle::class);
    }

    /**
     * Get the user who approved the assessment.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who rejected the assessment.
     */
    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Scope to get assessments by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('assessment_type', $type);
    }

    /**
     * Scope to get assessments by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get submitted assessments.
     */
    public function scopeSubmitted($query)
    {
        return $query->whereNotNull('submitted_at');
    }

    /**
     * Check if the assessment requires comments based on rating.
     */
    public function requiresComments(): bool
    {
        return $this->rating <= 2 || $this->rating >= 4;
    }

    /**
     * Check if the assessment is submitted.
     */
    public function isSubmitted(): bool
    {
        return $this->status === 'submitted' && !is_null($this->submitted_at);
    }

    /**
     * Check if the assessment is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the assessment is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if the assessment is in draft status.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Submit the assessment.
     */
    public function submit(): bool
    {
        if ($this->isDraft()) {
            $this->status = 'submitted';
            $this->submitted_at = now();
            return $this->save();
        }
        return false;
    }

    /**
     * Approve the assessment.
     */
    public function approve(): bool
    {
        if ($this->isSubmitted()) {
            $this->status = 'approved';
            return $this->save();
        }
        return false;
    }

    /**
     * Reject the assessment.
     */
    public function reject(): bool
    {
        if ($this->isSubmitted()) {
            $this->status = 'rejected';
            return $this->save();
        }
        return false;
    }

    /**
     * Check if the assessment has an extended deadline.
     */
    public function hasExtendedDeadline(): bool
    {
        return !is_null($this->extended_deadline);
    }

    /**
     * Get the effective deadline (extended or cycle deadline).
     */
    public function getEffectiveDeadline(): ?\Carbon\Carbon
    {
        if ($this->hasExtendedDeadline()) {
            return $this->extended_deadline;
        }
        
        return $this->assessmentCycle?->end_date;
    }

    /**
     * Check if the assessment is overdue.
     */
    public function isOverdue(): bool
    {
        if ($this->status !== 'draft') {
            return false;
        }

        $deadline = $this->getEffectiveDeadline();
        return $deadline && now()->gt($deadline);
    }

    /**
     * Get days until deadline.
     */
    public function getDaysUntilDeadline(): ?int
    {
        $deadline = $this->getEffectiveDeadline();
        if (!$deadline) {
            return null;
        }

        return now()->diffInDays($deadline, false);
    }

    /**
     * Check if assessment requires approval.
     */
    public function requiresApproval(): bool
    {
        // High-impact assessments or certain types may require approval
        return $this->assessment_type === 'manager' || 
               ($this->competency && $this->competency->weight >= 4.0);
    }

    /**
     * Get workflow status with additional context.
     */
    public function getWorkflowStatus(): array
    {
        return [
            'status' => $this->status,
            'is_overdue' => $this->isOverdue(),
            'has_extended_deadline' => $this->hasExtendedDeadline(),
            'requires_approval' => $this->requiresApproval(),
            'days_until_deadline' => $this->getDaysUntilDeadline(),
            'effective_deadline' => $this->getEffectiveDeadline(),
            'approved_by' => $this->approver?->name,
            'rejected_by' => $this->rejector?->name,
            'rejection_reason' => $this->rejection_reason
        ];
    }

    /**
     * Get validation rules for the assessment.
     */
    public static function validationRules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'assessor_id' => 'required|exists:users,id',
            'assessment_cycle_id' => 'nullable|exists:assessment_cycles,id',
            'rating' => 'nullable|integer|between:1,5',
            'comments' => 'nullable|string|max:2000',
            'assessment_type' => 'required|in:self,manager,peer,360',
            'status' => 'in:draft,submitted,approved,rejected',
            'evidence_files' => 'nullable|array',
            'development_notes' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get validation rules for assessment submission.
     */
    public static function submissionValidationRules(): array
    {
        $rules = self::validationRules();
        $rules['rating'] = 'required|integer|between:1,5';
        return $rules;
    }

    /**
     * Get conditional validation rules based on rating.
     */
    public static function conditionalValidationRules($rating): array
    {
        $rules = self::submissionValidationRules();
        
        // Require comments for extreme ratings
        if ($rating <= 2 || $rating >= 4) {
            $rules['comments'] = 'required|string|max:2000';
        }
        
        return $rules;
    }
}