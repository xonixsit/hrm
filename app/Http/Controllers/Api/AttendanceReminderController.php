<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Attendance;
use App\Mail\ClockInReminder;
use App\Mail\AdminReminderConfirmation;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AttendanceReminderController extends Controller
{
    public function sendClockInReminders(Request $request)
    {
        try {
            Log::info("Clock-in reminders endpoint called", [
                'user' => auth()->user()->email ?? 'unknown',
                'user_id' => auth()->id()
            ]);

            // Check if user is authenticated
            if (!auth()->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }

            // Check authorization
            if (!auth()->user()->hasRole(['Admin', 'HR'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to send reminders.'
                ], 403);
            }

            // Get employees who haven't clocked in today (Employee role only, exclude HR/Manager/Admin)
            $employeesWithoutClockIn = Employee::active()
                ->whereHas('user', function($query) {
                    $query->whereHas('roles', function($roleQuery) {
                        $roleQuery->where('name', 'Employee');
                    })
                    ->whereDoesntHave('roles', function($roleQuery) {
                        $roleQuery->whereIn('name', ['HR', 'Manager', 'Admin']);
                    });
                })
                ->whereDoesntHave('attendances', function($query) {
                    $query->whereDate('date', today());
                })
                ->with(['user', 'department', 'manager'])
                ->get();

            Log::info("Found employees without clock-in", [
                'count' => $employeesWithoutClockIn->count()
            ]);

            $sentCount = 0;
            $failedCount = 0;
            $missedEmployeesData = [];

            foreach ($employeesWithoutClockIn as $employee) {
                try {
                    if ($employee->user && $employee->user->email) {
                        Mail::to($employee->user->email)->send(new ClockInReminder($employee));
                        $sentCount++;
                        Log::info("Sent reminder to: " . $employee->user->email);
                        
                        // Collect data for attachment
                        $missedEmployeesData[] = [
                            'name' => $employee->user->name,
                            'employee_code' => $employee->employee_code,
                            'email' => $employee->user->email,
                            'department' => $employee->department->name ?? 'N/A',
                            'job_title' => $employee->job_title ?? 'N/A',
                            'phone' => $employee->phone ?? 'N/A',
                            'manager' => $employee->manager->name ?? 'N/A'
                        ];
                    }
                } catch (\Exception $mailError) {
                    $failedCount++;
                    Log::error("Failed to send email to employee {$employee->id}: " . $mailError->getMessage());
                }
            }

            // Send confirmation email to admin with attachment
            try {
                if ($sentCount > 0 && auth()->user()->email) {
                    Mail::to(auth()->user()->email)->send(
                        new AdminReminderConfirmation($sentCount, auth()->user()->name, $missedEmployeesData)
                    );
                    Log::info("Sent confirmation email to admin with attachment: " . auth()->user()->email);
                }
            } catch (\Exception $adminMailError) {
                Log::error("Failed to send admin confirmation: " . $adminMailError->getMessage());
            }

            Log::info("Manual clock-in reminders completed", [
                'sent_count' => $sentCount,
                'failed_count' => $failedCount,
                'admin_user' => auth()->user()->email
            ]);

            return response()->json([
                'success' => true,
                'count' => $sentCount,
                'failed' => $failedCount,
                'message' => "Clock-in reminders sent to {$sentCount} employees"
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send manual clock-in reminders", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'user' => auth()->user()->email ?? 'unknown'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reminders: ' . $e->getMessage()
            ], 500);
        }
    }
}