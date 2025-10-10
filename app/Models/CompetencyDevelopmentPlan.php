<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetencyDevelopmentPlan extends Model
{
    protected $fillable = [
        'employee_id',
        'competency_id',
        'current_rating',
        'target_rating',
        'target_date',
        'development_actions',
        'progress_notes',
        'status',
        'created_by'
    ];

    protected $casts = [
        'development_actions' => 'array',
        'target_date' => 'date',
        'current_rating' => 'integer',
        'target_rating' => 'integer'
    ];

    /**
     * Get the employee this development plan belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the competency this development plan targets.
     */
    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }

    /**
     * Get the user who created this development plan.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to get active development plans.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get completed development plans.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get development plans by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get overdue development plans.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'active')
                    ->whereNotNull('target_date')
                    ->where('target_date', '<', now());
    }

    /**
     * Check if the development plan is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the development plan is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the development plan is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === 'active' && 
               $this->target_date && 
               now()->gt($this->target_date);
    }

    /**
     * Calculate the progress percentage based on current vs target rating.
     */
    public function getProgressPercentage(): float
    {
        if (!$this->current_rating || !$this->target_rating) {
            return 0;
        }

        $improvement = $this->current_rating - ($this->current_rating ?? 1);
        $totalImprovement = $this->target_rating - ($this->current_rating ?? 1);
        
        if ($totalImprovement <= 0) {
            return 100;
        }

        return min(100, ($improvement / $totalImprovement) * 100);
    }

    /**
     * Get the rating improvement needed.
     */
    public function getRatingGap(): int
    {
        return $this->target_rating - ($this->current_rating ?? 1);
    }

    /**
     * Check if the development plan is paused.
     */
    public function isPaused(): bool
    {
        return $this->status === 'paused';
    }

    /**
     * Check if the development plan is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Complete the development plan.
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
     * Pause the development plan.
     */
    public function pause(): bool
    {
        if ($this->isActive()) {
            $this->status = 'paused';
            return $this->save();
        }
        return false;
    }

    /**
     * Resume the development plan.
     */
    public function resume(): bool
    {
        if ($this->isPaused()) {
            $this->status = 'active';
            return $this->save();
        }
        return false;
    }

    /**
     * Cancel the development plan.
     */
    public function cancel(): bool
    {
        if ($this->isActive() || $this->isPaused()) {
            $this->status = 'cancelled';
            return $this->save();
        }
        return false;
    }

    /**
     * Update the current rating and recalculate progress.
     */
    public function updateCurrentRating(int $rating): bool
    {
        $this->current_rating = $rating;
        
        // Auto-complete if target is reached
        if ($rating >= $this->target_rating && $this->isActive()) {
            $this->status = 'completed';
        }
        
        return $this->save();
    }

    /**
     * Add a development action to the plan.
     */
    public function addDevelopmentAction(array $action): bool
    {
        $actions = $this->development_actions ?? [];
        $actions[] = array_merge($action, [
            'id' => uniqid(),
            'created_at' => now()->toISOString(),
            'status' => 'pending'
        ]);
        
        $this->development_actions = $actions;
        return $this->save();
    }

    /**
     * Update a development action status.
     */
    public function updateDevelopmentAction(string $actionId, string $status): bool
    {
        $actions = $this->development_actions ?? [];
        
        foreach ($actions as &$action) {
            if ($action['id'] === $actionId) {
                $action['status'] = $status;
                $action['updated_at'] = now()->toISOString();
                break;
            }
        }
        
        $this->development_actions = $actions;
        return $this->save();
    }

    /**
     * Get completed development actions count.
     */
    public function getCompletedActionsCount(): int
    {
        $actions = $this->development_actions ?? [];
        return collect($actions)->where('status', 'completed')->count();
    }

    /**
     * Get total development actions count.
     */
    public function getTotalActionsCount(): int
    {
        return count($this->development_actions ?? []);
    }

    /**
     * Get development actions completion percentage.
     */
    public function getActionsCompletionPercentage(): float
    {
        $total = $this->getTotalActionsCount();
        if ($total === 0) {
            return 0;
        }
        
        $completed = $this->getCompletedActionsCount();
        return ($completed / $total) * 100;
    }

    /**
     * Get days remaining until target date.
     */
    public function getDaysRemaining(): ?int
    {
        if (!$this->target_date || $this->isCompleted() || $this->isCancelled()) {
            return null;
        }
        
        return max(0, now()->diffInDays($this->target_date, false));
    }

    /**
     * Get validation rules for the development plan.
     */
    public static function validationRules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'current_rating' => 'nullable|integer|between:1,5',
            'target_rating' => 'required|integer|between:1,5',
            'target_date' => 'nullable|date|after:today',
            'development_actions' => 'nullable|array',
            'progress_notes' => 'nullable|string|max:2000',
            'status' => 'in:active,completed,paused,cancelled',
            'created_by' => 'required|exists:users,id'
        ];
    }

    /**
     * Check if the plan has realistic goals.
     */
    public function hasRealisticGoals(): bool
    {
        $gap = $this->getRatingGap();
        $daysRemaining = $this->getDaysRemaining();
        
        // If no target date, assume it's realistic
        if (!$daysRemaining) {
            return true;
        }
        
        // Allow 30 days minimum per rating point improvement
        return $daysRemaining >= ($gap * 30);
    }

    /**
     * Get recommended development actions based on competency and rating gap.
     */
    public function getRecommendedActions(): array
    {
        $gap = $this->getRatingGap();
        $category = $this->competency->category ?? 'general';
        
        $recommendations = [
            'Attendance & Punctuality' => [
                'Set daily arrival reminders',
                'Track attendance patterns',
                'Establish morning routine',
                'Use time management tools'
            ],
            'Performance in Sales/Targets' => [
                'Set weekly sales goals',
                'Practice sales techniques',
                'Attend sales training',
                'Shadow top performers'
            ],
            'Communication Skills' => [
                'Join public speaking groups',
                'Practice active listening',
                'Take communication courses',
                'Seek feedback on presentations'
            ],
            'Teamwork & Cooperation' => [
                'Participate in team projects',
                'Practice conflict resolution',
                'Attend team building activities',
                'Mentor junior colleagues'
            ],
            'general' => [
                'Set specific learning goals',
                'Seek regular feedback',
                'Practice new skills daily',
                'Find a mentor or coach'
            ]
        ];
        
        $actions = $recommendations[$category] ?? $recommendations['general'];
        
        // Return appropriate number of actions based on gap
        return array_slice($actions, 0, min($gap + 1, count($actions)));
    }
}