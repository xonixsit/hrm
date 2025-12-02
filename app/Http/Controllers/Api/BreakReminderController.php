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
            // Get employees currently on break exceeding limits - use same logic as dashboard
            $attendances = Attendance::where('status', 'on_break')
                ->where('on_break', true)
                ->whereNotNull('current_break_start')
                ->whereDate('date', today())
                ->with(['employee.user', 'employee.department'])
                ->get();

            $violations = [];
            
            foreach ($attendances as $attendance) {
                if (!$attendance->employee || !$attendance->employee->user) continue;
                
                $breakSessions = $attendance->break_sessions ?? [];
                $currentBreakStart = $attendance->current_break_start;
                
                if ($currentBreakStart) {
                    $currentBreakDuration = (int) $currentBreakStart->diffInMinutes(now());
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
            
            Log::info("Break reminder process started", [
                'total_violations_found' => count($violations),
                'violations_details' => array_map(function($v) {
                    return [
                        'employee_id' => $v['attendance']->employee_id,
                        'employee_name' => $v['attendance']->employee ? $v['attendance']->employee->user->name : 'Unknown',
                        'break_number' => $v['break_number'],
                        'duration' => $v['duration'] . ' minutes',
                        'has_user' => $v['attendance']->employee && $v['attendance']->employee->user ? true : false,
                        'has_email' => $v['attendance']->employee && $v['attendance']->employee->user && $v['attendance']->employee->user->email ? true : false
                    ];
                }, $violations)
            ]);

            foreach ($violations as $violation) {
                $employee = $violation['attendance']->employee;
                if ($employee && $employee->user && $employee->user->email) {
                    try {
                        Mail::to($employee->user->email)->send(new BreakEndReminder($employee, $violation));
                        $sentCount++;
                        Log::info("Break reminder sent to employee", [
                            'employee_id' => $employee->id,
                            'employee_name' => $employee->first_name . ' ' . $employee->last_name,
                            'email' => $employee->user->email,
                            'break_number' => $violation['break_number'],
                            'duration' => $violation['duration']
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to send break reminder to employee", [
                            'employee_id' => $employee->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }

            // Send confirmation email to admin
            if ($sentCount > 0) {
                Mail::to(auth()->user()->email)->send(new AdminBreakReminderConfirmation($sentCount, auth()->user()->name));
                
                Log::info("Admin confirmation email sent", [
                    'sent_count' => $sentCount,
                    'admin_email' => auth()->user()->email,
                    'admin_name' => auth()->user()->name
                ]);
            }

            Log::info("Manual break reminders process completed", [
                'total_violations_found' => count($violations),
                'successfully_sent' => $sentCount,
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