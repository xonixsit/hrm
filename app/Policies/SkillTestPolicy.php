<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SkillTest;
use Illuminate\Auth\Access\HandlesAuthorization;

class SkillTestPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any skill tests.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasAnyRole(['Admin', 'HR', 'Manager']);
    }

    /**
     * Determine whether the user can view the skill test.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\SkillTest  $skillTest
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, SkillTest $skillTest)
    {
        return $user->hasAnyRole(['Admin', 'HR', 'Manager']);
    }

    /**
     * Determine whether the user can create skill tests.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can update the skill test.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\SkillTest  $skillTest
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, SkillTest $skillTest)
    {
        // Only admin and HR can update tests
        // Only allow updates if test is in draft status
        return $user->hasAnyRole(['Admin', 'HR']) && $skillTest->isDraft();
    }

    /**
     * Determine whether the user can delete the skill test.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\SkillTest  $skillTest
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, SkillTest $skillTest)
    {
        // Only admin and HR can delete tests
        // Only allow deletion if test is in draft status
        return $user->hasAnyRole(['Admin', 'HR']) && $skillTest->isDraft();
    }

    /**
     * Determine whether the user can publish the skill test.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\SkillTest  $skillTest
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function publish(User $user, SkillTest $skillTest)
    {
        // Only admin and HR can publish tests
        // Only allow publishing if test is in draft status
        return $user->hasAnyRole(['Admin', 'HR']) && $skillTest->isDraft();
    }

    /**
     * Determine whether the user can archive the skill test.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\SkillTest  $skillTest
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function archive(User $user, SkillTest $skillTest)
    {
        // Only admin and HR can archive tests
        // Only allow archiving if test is published
        return $user->hasAnyRole(['Admin', 'HR']) && $skillTest->isPublished();
    }

    /**
     * Determine whether the user can assign the skill test.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\SkillTest  $skillTest
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function assign(User $user, SkillTest $skillTest)
    {
        // Only admin, HR, and managers can assign tests
        // Only allow assigning if test is published
        return $user->hasAnyRole(['Admin', 'HR', 'Manager']) && $skillTest->isPublished();
    }

    /**
     * Determine whether the user can review test responses.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function review(User $user)
    {
        return $user->hasAnyRole(['Admin', 'HR']);
    }

    /**
     * Determine whether the user can view analytics for the skill test.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\SkillTest  $skillTest
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAnalytics(User $user, SkillTest $skillTest)
    {
        return $user->hasAnyRole(['Admin', 'HR', 'Manager']);
    }
}
