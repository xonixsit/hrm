<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Mail\ClockInReminder;
use App\Mail\AdminReminderConfirmation;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AttendanceReminderController extends Controller
{
    public function sendClockInReminders(Request $request)
    {
        try {
            // Get employees who haven't clocked in today
            $employeesWithoutClockIn = Employee::active()
                ->whereHas('user', function($query) {
                    $query->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'Employee');
                    });
                })
                ->whereDoesntHave('attendances', function($query) {
                    $query->whereDate('date', today());
                })
                ->with(['user'])
                ->get();

            $sentCount = 0;

            foreach ($employeesWithoutClockIn as $employee) {
                if ($employee->user && $employee->user->email) {
                    Mail::to($employee->user->email)->send(new ClockInReminder($employee));
                    $sentCount++;
                }
            }

            // Send confirmation email to admin
            Mail::to(auth()->user()->email)->send(new \App\Mail\AdminReminderConfirmation($sentCount, auth()->user()->name));

            // Send confirmation email to admin
            if ($sentCount > 0 && auth()->user()->email) {
                Mail::to(auth()->user()->email)->send(
                    new AdminReminderConfirmation($sentCount, auth()->user()->name)
                );
            }

            Log::info("Manual clock-in reminders sent by admin", [
                'sent_count' => $sentCount,
                'admin_user' => auth()->user()->email
            ]);

            return response()->json([
                'success' => true,
                'count' => $sentCount,
                'message' => "Clock-in reminders sent to {$sentCount} employees"
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send manual clock-in reminders: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reminders'
            ], 500);
        }
    }
}