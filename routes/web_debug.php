<?php

use App\Services\BirthdayService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

// Temporary debug route - remove after testing
Route::get('/debug/birthdays', function (BirthdayService $birthdayService) {
    Log::info('=== DEBUG BIRTHDAY ROUTE ===');
    
    $today = now()->setTimezone(config('app.timezone'));
    $todaysBirthdays = $birthdayService->getTodaysBirthdays();
    $upcomingBirthdays = $birthdayService->getUpcomingBirthdays(7);
    
    return response()->json([
        'timezone' => config('app.timezone'),
        'today' => $today->format('Y-m-d H:i:s T'),
        'today_month_day' => $today->format('m-d'),
        'todays_birthdays_count' => $todaysBirthdays->count(),
        'todays_birthdays' => $todaysBirthdays->map(function ($emp) {
            return [
                'id' => $emp->id,
                'name' => $emp->user->name,
                'email' => $emp->user->email,
                'dob' => $emp->date_of_birth->format('Y-m-d'),
                'dob_month_day' => $emp->date_of_birth->format('m-d'),
                'status' => $emp->status,
                'exit_date' => $emp->exit_date,
            ];
        }),
        'upcoming_birthdays_count' => $upcomingBirthdays->count(),
        'upcoming_birthdays' => $upcomingBirthdays->map(function ($birthday) {
            return [
                'name' => $birthday['employee']->user->name,
                'dob' => $birthday['employee']->date_of_birth->format('Y-m-d'),
                'days_until' => $birthday['days_until'],
            ];
        }),
        'check_laravel_log_for_details' => true,
    ]);
})->middleware('auth');
