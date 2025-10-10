<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Competency extends Model
{
    protected $fillable = [
        'name', 
        'description',
        'category',
        'weight',
        'measurement_indicators',
        'rating_guidelines',
        'department_id',
        'role_specific',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'measurement_indicators' => 'array',
        'rating_guidelines' => 'array',
        'is_active' => 'boolean',
        'role_specific' => 'boolean',
        'weight' => 'decimal:2'
    ];

    /**
     * Get the employee competencies for this competency.
     */
    public function employeeCompetencies(): HasMany
    {
        return $this->hasMany(EmployeeCompetency::class);
    }

    /**
     * Get the employees who have this competency.
     */
    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_competencies')
                    ->withPivot('rating', 'comments', 'assessed_at', 'assessed_by')
                    ->withTimestamps();
    }

    /**
     * Scope to get only active competencies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get competencies grouped by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get the department this competency belongs to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the user who created this competency.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this competency.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the competency assessments for this competency.
     */
    public function assessments(): HasMany
    {
        return $this->hasMany(CompetencyAssessment::class);
    }

    /**
     * Get the development plans for this competency.
     */
    public function developmentPlans(): HasMany
    {
        return $this->hasMany(CompetencyDevelopmentPlan::class);
    }

    /**
     * Scope to get competencies by department.
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope to get role-specific competencies.
     */
    public function scopeRoleSpecific($query)
    {
        return $query->where('role_specific', true);
    }
}
