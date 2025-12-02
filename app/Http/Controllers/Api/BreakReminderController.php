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
            // Get break violations using the same method as dashboard
            $dashboardController = new \App\Http\Controllers\DashboardController(app(\App\Services\BirthdayService::class));
            $breakViolationsData = $dashboardController->getBreakViolationsApi();
            $breakViolations = $breakViolationsData->getData()->violations ?? [];
            
            // Convert dashboard format to API format for email sending
            $violations = [];
            foreach ($breakViolations as $violation) {
                // Get the attendance record for this employee
                $attendance = Attendance::where('employee_id', $violation->employee_id)
                    ->whereDate('date', today())
                    ->where('on_break', true)
                    ->first();
                    
                if ($attendance && $attendance->employee) {
                    $violations[] = [
                        'attendance' => $attendance,
                        'break_number' => $violation->break_number,
                        'duration' => $this->parseDurationToMinutes($violation->duration),
                        'limit' => $this->parseDurationToMinutes($violation->limit),
                        'overtime' => $this->parseDurationToMinutes($violation->overtime)
                    ];
                }
            }

            $sentCount = 0;
            
            Log::info("Break reminder process started", [
                'total_violations_found' => count($violations),
                'violations_details' => array_map(function($v) {
                    return [
                        'employee_id' => $v['attendance']->employee_id,
                        'employee_name' => $v['attendance']->employee ? $v['attendance']->employee->first_name . ' ' . $v['attendance']->employee->last_name : 'Unknown',
                        'break_number' => $v['break_number'],
                        'duration' => $v['duration'],
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
    
    /**
     * Parse duration string (like "1h 30m" or "45m") back to minutes
     */
    private function parseDurationToMinutes($durationString)
    {
        $minutes = 0;
        
        // Match hours (e.g., "1h")
        if (preg_match('/(\d+)h/', $durationString, $matches)) {
            $minutes += intval($matches[1]) * 60;
        }
        
        // Match minutes (e.g., "30m")
        if (preg_match('/(\d+)m/', $durationString, $matches)) {
            $minutes += intval($matches[1]);
        }
        
        return $minutes;
    }
}