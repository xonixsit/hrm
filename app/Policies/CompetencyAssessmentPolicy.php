<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CompetencyAssessment;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompetencyAssessmentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any competency assessments.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']);
    }

    /**
     * Determine whether the user can view the competency assessment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\CompetencyAssessment  $assessment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, CompetencyAssessment $assessment)
    {
        // Admin and HR can view all assessments
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can view assessments for their department employees
        if ($user->hasRole('Manager') && $user->employee) {
            return $assessment->employee->department_id === $user->employee->department_id;
        }

        // Employees can view their own assessments or assessments they conducted
        if ($user->employee) {
            return $assessment->employee_id === $user->employee->id || 
                   $assessment->assessor_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create competency assessments.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasAnyRole(['Manager', 'Admin', 'HR']);
    }

    /**
     * Determine whether the user can conduct self-assessments.
     *
     * @param  \App\Models\User  $user
     * @param  int  $employeeId
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function createSelfAssessment(User $user, int $employeeId)
    {
        return $user->employee && $user->employee->id === $employeeId;
    }

    /**
     * Determine whether the user can conduct manager assessments.
     *
     * @param  \App\Models\User  $user
     * @param  int  $employeeId
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function createManagerAssessment(User $user, int $employeeId)
    {
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        if ($user->hasRole('Manager') && $user->employee) {
            // Check if the employee is in the same department
            $targetEmployee = \App\Models\Employee::find($employeeId);
            return $targetEmployee && 
                   $targetEmployee->department_id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can conduct peer assessments.
     *
     * @param  \App\Models\User  $user
     * @param  int  $employeeId
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function createPeerAssessment(User $user, int $employeeId)
    {
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        if ($user->employee) {
            $targetEmployee = \App\Models\Employee::find($employeeId);
            // Peers must be in the same department and not assessing themselves
            return $targetEmployee && 
                   $targetEmployee->department_id === $user->employee->department_id &&
                   $targetEmployee->id !== $user->employee->id;
        }

        return false;
    }

    /**
     * Determine whether the user can conduct 360-degree assessments.
     *
     * @param  \App\Models\User  $user
     * @param  int  $employeeId
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create360Assessment(User $user, int $employeeId)
    {
        // Only managers, HR, and admins can initiate 360-degree assessments
        return $user->hasAnyRole(['Manager', 'Admin', 'HR']);
    }

    /**
     * Determine whether the user can update the competency assessment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\CompetencyAssessment  $assessment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, CompetencyAssessment $assessment)
    {
        // Admin and HR can update any assessment
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Cannot update submitted assessments unless admin/HR
        if ($assessment->status === 'submitted') {
            return false;
        }

        // Assessors can update their own assessments if not submitted
        if ($assessment->assessor_id === $user->id) {
            return true;
        }

        // Managers can update assessments for their department employees
        if ($user->hasRole('Manager') && $user->employee) {
            return $assessment->employee->department_id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the competency assessment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\CompetencyAssessment  $assessment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, CompetencyAssessment $assessment)
    {
        // Only Admin and HR can delete assessments
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Assessors can delete their own draft assessments
        if ($assessment->assessor_id === $user->id && $assessment->status === 'draft') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can approve competency assessments.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\CompetencyAssessment  $assessment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function approve(User $user, CompetencyAssessment $assessment)
    {
        // Admin and HR can approve any assessment
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can approve assessments for their department employees
        if ($user->hasRole('Manager') && $user->employee) {
            return $assessment->employee->department_id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can reject competency assessments.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\CompetencyAssessment  $assessment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function reject(User $user, CompetencyAssessment $assessment)
    {
        return $this->approve($user, $assessment);
    }

    /**
     * Determine whether the user can view assessment analytics.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAnalytics(User $user)
    {
        return $user->hasAnyRole(['Manager', 'Admin', 'HR']);
    }

    /**
     * Determine whether the user can view department-wide analytics.
     *
     * @param  \App\Models\User  $user
     * @param  int|null  $departmentId
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewDepartmentAnalytics(User $user, int $departmentId = null)
    {
        // Admin and HR can view all department analytics
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can only view their own department analytics
        if ($user->hasRole('Manager') && $user->employee) {
            return $departmentId === null || $departmentId === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can export assessment data.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function export(User $user)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }
}