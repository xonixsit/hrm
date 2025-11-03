<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for individual employee attendance updates
Broadcast::channel('attendance.{employeeId}', function ($user, $employeeId) {
    // User can only listen to their own attendance updates
    return $user->employee && (int) $user->employee->id === (int) $employeeId;
});

// Global channel for admin/manager dashboards
Broadcast::channel('attendance.global', function ($user) {
    // Only admins and managers can listen to global attendance updates
    return $user->hasRole(['Admin', 'Manager', 'HR']);
});