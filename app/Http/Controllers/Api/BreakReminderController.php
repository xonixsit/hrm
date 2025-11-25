<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Mail\BreakEndReminder;
use App\Mail\AdminBreakReminderConfirmation;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class BreakReminderController extends Controller
{
    public function sendBreakReminders(Request $request)
    {
        try {
            // Get employees currently on break exceeding limits
            $attendances = Attendance::whereDate('date', today())
                ->where('on_break', true)
                ->whereNotNull('current_break_start')
                ->with(['employee.user', 'employee.department'])
                ->get();

            $violations = [];
            
            foreach ($attendances as $attendance) {
                if (!$attendance->employee || !$attendance->employee->user) continue;
                
                $breakSessions = $attendance->break_sessions ?? [];
                $currentBreakStart = $attendance->current_break_start;
                
                if ($currentBreakStart) {
                    $currentBreakDuration = now()->diffInMinutes($currentBreakStart);
                    $breakNumber = count($breakSessions) + 1;
                    
                    // Define break limits
                    $limits = [1 => 15, 2 => 30, 3 => 15]; // minutes
                    $limit = $limits[$breakNumber] ?? 15;
                    
                    if ($currentBreakDuration > $limit) {
                        $violations[] = [
                            'attendance' => $attendance,
                            'break_number' => $breakNumber,
                            'duration' => $currentBreakDuration,
                            'limit' => $limit,
                            'overtime' => $currentBreakDuration - $limit
                        ];
                    }
                }
            }

            $sentCount = 0;

            foreach ($violations as $violation) {
                $employee = $violation['attendance']->employee;
                if ($employee->user && $employee->user->email) {
                    Mail::to($employee->user->email)->send(new BreakEndReminder($employee, $violation));
                    $sentCount++;
                }
            }

            // Send confirmation email to admin
            if ($sentCount > 0) {
                Mail::to(auth()->user()->email)->send(new AdminBreakReminderConfirmation($sentCount, auth()->user()->name));
            }

            Log::info("Manual break reminders sent by admin", [
                'sent_count' => $sentCount,
                'admin_user' => auth()->user()->email
            ]);

            return response()->json([
                'success' => true,
                'count' => $sentCount,
                'message' => "Break reminders sent to {$sentCount} employees"
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send manual break reminders: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send break reminders'
            ], 500);
        }
    }
}