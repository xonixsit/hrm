<?php

namespace App\Policies;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FeedbackPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view feedbacks (employees can see feedback about them)
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Feedback $feedback): bool
    {
        // Admins and HR can view all feedbacks
        if ($user->hasAnyRole(['Admin', 'HR', 'Manager'])) {
            return true;
        }
        
        // Users can view feedbacks they created or feedbacks about them
        return $user->id === $feedback->reviewer_id || $user->id === $feedback->reviewee_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only Admin, HR, and Manager roles can create/submit feedback
        return $user->hasAnyRole(['Admin', 'HR', 'Manager']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Feedback $feedback): bool
    {
        // Admins and HR can update any feedback
        if ($user->hasAnyRole(['Admin', 'HR'])) {
            return true;
        }
        
        // Users can only update feedback they created
        return $user->id === $feedback->reviewer_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Feedback $feedback): bool
    {
        // Admins can delete any feedback
        if ($user->hasRole('Admin')) {
            return true;
        }
        
        // Users can only delete feedback they created
        return $user->id === $feedback->reviewer_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Feedback $feedback): bool
    {
        return $user->hasRole('Admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Feedback $feedback): bool
    {
        return $user->hasRole('Admin');
    }
}