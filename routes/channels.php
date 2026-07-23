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

// Private channel for team messaging conversations
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return \DB::table('conversation_users')
        ->where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->exists();
});

// Per-user private channel for sidebar unread count updates
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Presence channel for real-time user status
Broadcast::channel('presence.users', function ($user) {
    // All authenticated users can join the presence channel
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'profile_picture' => $user->employee->profile_pic ?? null,
    ];
});