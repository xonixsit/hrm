<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Models\EmailPreference;
use App\Mail\BirthdayWish;
use App\Mail\BirthdayReminder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BirthdayService
{
    /**
     * Get employees with birthdays today
     */
    public function getTodaysBirthdays(): Collection
    {
        $today = now()->setTimezone(config('app.timezone'))->startOfDay();
        
        $employees = Employee::with(['user', 'department'])
            ->whereNotNull('date_of_birth')
            ->get();
        
        Log::info('Birthday check - Today: ' . $today->format('Y-m-d m-d'), ['month' => $today->month, 'day' => $today->day]);
        Log::info('Total employees with DOB: ' . $employees->count());
        
        $birthdays = $employees->filter(function ($employee) use ($today) {
            $dob = Carbon::parse($employee->date_of_birth);
            $match = $dob->month === $today->month && $dob->day === $today->day;
            if ($match) {
                Log::info('Birthday match found: ' . $employee->user->name . ' DOB: ' . $dob->format('Y-m-d'));
            }
            return $match;
        });
        
        Log::info('Total birthdays today: ' . $birthdays->count());
        return $birthdays;
    }

    /**
     * Get employees with upcoming birthdays within specified days
     */
    public function getUpcomingBirthdays(int $daysAhead = 7): Collection
    {
        // Use local timezone for date calculations to avoid timezone issues
        $today = now()->setTimezone(config('app.timezone', 'UTC'))->startOfDay();
        $upcomingBirthdays = collect();

        // Get all employees with birthdays and calculate their next birthday
        $employees = Employee::active()
            ->with(['user', 'department'])
            ->whereNotNull('date_of_birth')
            ->get();

        foreach ($employees as $employee) {
            // Create birthday for this year
            $birthdayThisYear = Carbon::create(
                $today->year,
                $employee->date_of_birth->month,
                $employee->date_of_birth->day,
                0, 0, 0,
                config('app.timezone', 'UTC')
            )->startOfDay();

            // If birthday has passed this year, check next year
            if ($birthdayThisYear->lt($today)) {
                $birthdayThisYear->addYear();
            }

            // Calculate days until birthday
            $daysUntil = $today->diffInDays($birthdayThisYear, false);

            // Only include birthdays within the specified range (excluding today)
            if ($daysUntil > 0 && $daysUntil <= $daysAhead) {
                $upcomingBirthdays->push([
                    'employee' => $employee,
                    'birthday_date' => $birthdayThisYear,
                    'days_until' => $daysUntil,
                ]);
            }
        }

        return $upcomingBirthdays->sortBy('days_until');
    }

    /**
     * Send birthday wishes to employees with birthdays today
     */
    public function sendBirthdayWishes(): int
    {
        $birthdayEmployees = $this->getTodaysBirthdays();
        $sentCount = 0;

        foreach ($birthdayEmployees as $employee) {
            if (!$employee->user || !$employee->user->email) {
                Log::warning("Birthday employee {$employee->id} has no valid email address");
                continue;
            }

            // Check if employee wants birthday notifications
            $preferences = EmailPreference::getForUser($employee->user);
            if (!$preferences->wantsNotification('birthday_notifications')) {
                Log::info("Skipping birthday email for {$employee->user->email} - notifications disabled");
                continue;
            }

            try {
                Mail::to($employee->user->email)->send(new BirthdayWish($employee));
                $sentCount++;
                
                Log::info("Birthday wish sent to {$employee->user->email}");
            } catch (\Exception $e) {
                Log::error("Failed to send birthday wish to {$employee->user->email}: " . $e->getMessage());
            }
        }

        return $sentCount;
    }

    /**
     * Send birthday reminders to all employees about upcoming birthdays
     */
    public function sendBirthdayReminders(): int
    {
        $sentCount = 0;
        
        // Get all active users who want birthday reminders
        $users = User::whereHas('employee', function ($query) {
            $query->active();
        })->get();

        foreach ($users as $user) {
            $preferences = EmailPreference::getForUser($user);
            
            if (!$preferences->wantsNotification('birthday_reminders')) {
                continue;
            }

            $daysAhead = $preferences->birthday_reminder_days ?? 3;
            $upcomingBirthdays = $this->getUpcomingBirthdays($daysAhead);

            // Filter out the user's own birthday from reminders
            $upcomingBirthdays = $upcomingBirthdays->filter(function ($birthday) use ($user) {
                return $birthday['employee']->user_id !== $user->id;
            });

            if ($upcomingBirthdays->isEmpty()) {
                continue;
            }

            try {
                Mail::to($user->email)->send(new BirthdayReminder($upcomingBirthdays, $daysAhead));
                $sentCount++;
                
                Log::info("Birthday reminder sent to {$user->email} for {$upcomingBirthdays->count()} upcoming birthdays");
            } catch (\Exception $e) {
                Log::error("Failed to send birthday reminder to {$user->email}: " . $e->getMessage());
            }
        }

        return $sentCount;
    }

    /**
     * Get birthday statistics for dashboard
     */
    public function getBirthdayStats(): array
    {
        $today = now();
        
        return [
            'today' => $this->getTodaysBirthdays()->count(),
            'this_week' => $this->getUpcomingBirthdays(7)->count(),
            'this_month' => $this->getBirthdaysInMonth($today->month, $today->year)->count(),
            'next_birthday' => $this->getNextBirthday(),
        ];
    }

    /**
     * Get birthdays in a specific month
     */
    public function getBirthdaysInMonth(int $month, int $year): Collection
    {
        return Employee::active()
            ->with(['user', 'department'])
            ->whereNotNull('date_of_birth')
            ->whereRaw('MONTH(date_of_birth) = ?', [$month])
            ->get()
            ->map(function ($employee) use ($year) {
                $birthdayThisYear = Carbon::create(
                    $year,
                    $employee->date_of_birth->month,
                    $employee->date_of_birth->day
                );

                return [
                    'employee' => $employee,
                    'birthday_date' => $birthdayThisYear,
                    'age_turning' => $birthdayThisYear->year - $employee->date_of_birth->year,
                ];
            })
            ->sortBy('birthday_date.day');
    }

    /**
     * Get the next upcoming birthday
     */
    public function getNextBirthday(): ?array
    {
        // Get upcoming birthdays (excluding today)
        $upcomingBirthdays = $this->getUpcomingBirthdays(365);
        
        // Filter out any birthdays that are 0 days away (shouldn't happen with our logic, but just in case)
        $nextBirthday = $upcomingBirthdays->filter(function ($birthday) {
            return $birthday['days_until'] > 0;
        })->first();
        
        return $nextBirthday;
    }

    /**
     * Get birthday calendar data for a specific month
     */
    public function getBirthdayCalendar(int $month, int $year): Collection
    {
        return $this->getBirthdaysInMonth($month, $year)
            ->groupBy(function ($birthday) {
                return $birthday['birthday_date']->day;
            });
    }

    /**
     * Check if today has any birthdays
     */
    public function hasBirthdaysToday(): bool
    {
        return $this->getTodaysBirthdays()->isNotEmpty();
    }

    /**
     * Get formatted birthday message for dashboard
     */
    public function getTodaysBirthdayMessage(): ?string
    {
        $birthdays = $this->getTodaysBirthdays();
        
        if ($birthdays->isEmpty()) {
            return null;
        }

        $count = $birthdays->count();
        
        if ($count === 1) {
            $employee = $birthdays->first();
            return "🎉 It's {$employee->getFullName()}'s birthday today!";
        }

        $names = $birthdays->take(2)->pluck('user.name')->join(' and ');
        if ($count > 2) {
            $names .= " and " . ($count - 2) . " others";
        }

        return "🎉 {$names} are celebrating birthdays today!";
    }
}