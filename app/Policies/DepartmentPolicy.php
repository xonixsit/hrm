<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Department;
use Illuminate\Auth\Access\HandlesAuthorization;

class DepartmentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any departments.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasAnyRole(['Employee', 'Manager', 'Admin', 'HR']);
    }

    /**
     * Determine whether the user can view the department.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Department $department)
    {
        // Admin and HR can view all departments
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers and employees can view their own department
        if ($user->employee) {
            return $department->id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create departments.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can update the department.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Department $department)
    {
        // Admin and HR can update all departments
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Department managers can update their own department (limited fields)
        if ($user->hasRole('Manager') && $user->employee) {
            return $department->manager_id === $user->employee->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the department.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Department $department)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can view department competency framework.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewCompetencyFramework(User $user, Department $department)
    {
        // Admin and HR can view all department competency frameworks
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can view their department's competency framework
        if ($user->hasRole('Manager') && $user->employee) {
            return $department->id === $user->employee->department_id;
        }

        // Employees can view their department's competency framework
        if ($user->employee) {
            return $department->id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can manage department competency framework.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function manageCompetencyFramework(User $user, Department $department)
    {
        // Admin and HR can manage all department competency frameworks
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Department managers can manage their department's competency framework
        if ($user->hasRole('Manager') && $user->employee) {
            return $department->manager_id === $user->employee->id;
        }

        return false;
    }

    /**
     * Determine whether the user can view department competency analytics.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewCompetencyAnalytics(User $user, Department $department)
    {
        // Admin and HR can view all department analytics
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can view their department's analytics
        if ($user->hasRole('Manager') && $user->employee) {
            return $department->id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can conduct department-wide assessments.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function conductDepartmentAssessments(User $user, Department $department)
    {
        // Admin and HR can conduct assessments in any department
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Managers can conduct assessments in their department
        if ($user->hasRole('Manager') && $user->employee) {
            return $department->id === $user->employee->department_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create assessment cycles for the department.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function createAssessmentCycles(User $user, Department $department)
    {
        // Admin and HR can create assessment cycles for any department
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Department managers can create assessment cycles for their department
        if ($user->hasRole('Manager') && $user->employee) {
            return $department->manager_id === $user->employee->id;
        }

        return false;
    }

    /**
     * Determine whether the user can export department competency data.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function exportCompetencyData(User $user, Department $department)
    {
        // Admin and HR can export data from any department
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }

        // Department managers can export their department's data
        if ($user->hasRole('Manager') && $user->employee) {
            return $department->manager_id === $user->employee->id;
        }

        return false;
    }

    /**
     * Determine whether the user can assign competencies to department roles.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function assignRoleCompetencies(User $user, Department $department)
    {
        return $this->manageCompetencyFramework($user, $department);
    }
}