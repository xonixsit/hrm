<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'client',
        'status',
        'priority',
        'budget',
        'start_date',
        'due_date',
        'end_date',
        'progress',
        'manager_id',
        'is_default',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'progress' => 'integer',
        'is_default' => 'boolean',
    ];

    protected $appends = [
        'tasks_completed',
        'tasks_total',
    ];

    // Relationships
    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class);
    }

    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'project_team_members', 'project_id', 'employee_id')
                    ->withTimestamps();
    }

    // Accessors
    public function getTasksCompletedAttribute(): int
    {
        return $this->tasks()->where('status', 'completed')->count();
    }

    public function getTasksTotalAttribute(): int
    {
        return $this->tasks()->count();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    // Methods
    public function updateProgress(): void
    {
        $totalTasks = $this->tasks()->count();
        
        if ($totalTasks === 0) {
            $this->update(['progress' => 0]);
            return;
        }

        $completedTasks = $this->tasks()->where('status', 'completed')->count();
        $progress = round(($completedTasks / $totalTasks) * 100);
        
        $this->update(['progress' => $progress]);
    }

    public function isOverdue(): bool
    {
        return $this->due_date && $this->due_date->isPast() && $this->status !== 'completed';
    }

    public function getDaysRemaining(): ?int
    {
        if (!$this->due_date || $this->status === 'completed') {
            return null;
        }

        return now()->diffInDays($this->due_date, false);
    }
}
