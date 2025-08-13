<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class AttendanceController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('Admin') || $user->hasRole('HR')) {
            $attendances = Attendance::with('employee.user')->paginate(10);
        } else {
            $employee = $user->employee;
            $attendances = Attendance::where('employee_id', $employee->id)->paginate(10);
        }
        return Inertia::render('Attendances/Index', ['attendances' => $attendances]);
    }

    public function clockIn(Request $request)
    {
        $employee = Auth::user()->employee;
        $today = now()->format('Y-m-d');
        
        // Check if already clocked in today
        $existing = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->where('status', '!=', 'clocked_out')
            ->first();
            
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Already clocked in today.',
                'attendance' => $existing
            ], 400);
        }

        // Validate location if provided
        $locationData = $request->input('location');
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');
        $locationVerified = false;

        if ($latitude && $longitude) {
            // Here you could add location validation logic
            // For now, we'll just mark it as verified if coordinates are provided
            $locationVerified = true;
        }

        $attendance = Attendance::create([
            'employee_id' => $employee->id,
            'date' => $today,
            'clock_in' => now(),
            'ip_address' => $request->ip(),
            'location' => $locationData,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'location_verified' => $locationVerified,
            'status' => 'clocked_in',
            'on_break' => false,
            'total_break_minutes' => 0,
            'break_sessions' => []
        ]);

        $this->logAudit('Attendance Clock In', 'Clocked in for employee ID: ' . $employee->id);
        
        // Broadcast real-time update
        $this->broadcastAttendanceUpdate($employee->id, $attendance);
        
        return response()->json([
            'success' => true,
            'message' => 'Clocked in successfully.',
            'attendance' => $attendance,
            'clock_in_time' => $attendance->clock_in->toISOString()
        ]);
    }

    public function clockOut(Request $request)
    {
        $employee = Auth::user()->employee;
        $today = now()->format('Y-m-d');
        
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->where('status', '!=', 'clocked_out')
            ->first();
            
        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No active clock-in record found for today.'
            ], 400);
        }

        // End any active break
        if ($attendance->on_break) {
            $attendance->endBreak();
        }

        // Calculate total work minutes
        $workMinutes = $attendance->calculateWorkMinutes();
        
        $attendance->update([
            'clock_out' => now(),
            'work_minutes' => $workMinutes,
            'status' => 'clocked_out'
        ]);

        $this->logAudit('Attendance Clock Out', 'Clocked out for employee ID: ' . $employee->id);
        
        // Broadcast real-time update
        $this->broadcastAttendanceUpdate($employee->id, $attendance);
        
        return response()->json([
            'success' => true,
            'message' => 'Clocked out successfully.',
            'attendance' => $attendance,
            'work_duration' => $attendance->work_duration,
            'break_duration' => $attendance->break_duration
        ]);
    }

    public function startBreak(Request $request)
    {
        $employee = Auth::user()->employee;
        $today = now()->format('Y-m-d');
        
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->where('status', 'clocked_in')
            ->first();
            
        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No active clock-in record found for today.'
            ], 400);
        }

        if ($attendance->startBreak()) {
            $this->logAudit('Break Started', 'Started break for employee ID: ' . $employee->id);
            
            // Broadcast real-time update
            $this->broadcastAttendanceUpdate($employee->id, $attendance);
            
            return response()->json([
                'success' => true,
                'message' => 'Break started successfully.',
                'attendance' => $attendance,
                'break_start_time' => $attendance->current_break_start?->toISOString()
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to start break. Already on break.'
        ], 400);
    }

    public function endBreak(Request $request)
    {
        $employee = Auth::user()->employee;
        $today = now()->format('Y-m-d');
        
        // Look for attendance record that is either on_break or clocked_in with on_break flag
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->where('on_break', true)
            ->first();
            
        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No active break record found for today.'
            ], 400);
        }

        if ($attendance->endBreak()) {
            $this->logAudit('Break Ended', 'Ended break for employee ID: ' . $employee->id);
            
            // Broadcast real-time update
            $this->broadcastAttendanceUpdate($employee->id, $attendance);
            
            return response()->json([
                'success' => true,
                'message' => 'Break ended successfully.',
                'attendance' => $attendance,
                'break_duration' => $attendance->break_duration
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to end break.'
        ], 400);
    }

    public function getCurrentStatus(Request $request)
    {
        $employee = Auth::user()->employee;
        $today = now()->format('Y-m-d');
        
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            return response()->json([
                'clocked_in' => false,
                'on_break' => false,
                'clock_in_time' => null,
                'todays_summary' => $this->getTodaysSummary($employee->id),
                'recent_activities' => $this->getRecentActivities($employee->id),
                'stats' => $this->getAttendanceStats($employee->id)
            ]);
        }

        return response()->json([
            'clocked_in' => $attendance->isClockedIn(),
            'on_break' => $attendance->on_break,
            'clock_in_time' => $attendance->clock_in?->toISOString(),
            'break_start_time' => $attendance->current_break_start?->toISOString(),
            'current_session' => $attendance,
            'todays_summary' => $this->getTodaysSummary($employee->id),
            'recent_activities' => $this->getRecentActivities($employee->id),
            'stats' => $this->getAttendanceStats($employee->id)
        ]);
    }

    private function getTodaysSummary($employeeId)
    {
        $today = now()->format('Y-m-d');
        $attendance = Attendance::where('employee_id', $employeeId)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            return [
                'total_hours' => '0h 0m',
                'break_time' => '0h 0m',
                'sessions' => 0,
                'clock_ins' => 0
            ];
        }

        return [
            'total_hours' => $attendance->work_duration,
            'break_time' => $attendance->break_duration,
            'sessions' => count($attendance->break_sessions ?? []) + 1,
            'clock_ins' => 1
        ];
    }

    private function getRecentActivities($employeeId, $limit = 10)
    {
        $activities = [];
        $today = now()->format('Y-m-d');
        
        $attendance = Attendance::where('employee_id', $employeeId)
            ->whereDate('date', $today)
            ->first();

        if ($attendance) {
            if ($attendance->clock_in) {
                $activities[] = [
                    'id' => 'clock_in_' . $attendance->id,
                    'type' => 'clock-in',
                    'action' => 'Clocked in',
                    'time' => $attendance->clock_in->toISOString()
                ];
            }

            // Add break activities
            foreach ($attendance->break_sessions ?? [] as $index => $session) {
                $activities[] = [
                    'id' => 'break_start_' . $attendance->id . '_' . $index,
                    'type' => 'break-start',
                    'action' => 'Started break',
                    'time' => $session['start']
                ];
                
                if (isset($session['end'])) {
                    $activities[] = [
                        'id' => 'break_end_' . $attendance->id . '_' . $index,
                        'type' => 'break-end',
                        'action' => 'Ended break',
                        'time' => $session['end']
                    ];
                }
            }

            if ($attendance->clock_out) {
                $activities[] = [
                    'id' => 'clock_out_' . $attendance->id,
                    'type' => 'clock-out',
                    'action' => 'Clocked out',
                    'time' => $attendance->clock_out->toISOString()
                ];
            }
        }

        // Sort by time descending and limit
        usort($activities, function($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });

        return array_slice($activities, 0, $limit);
    }

    private function getAttendanceStats($employeeId)
    {
        // Weekly hours
        $weeklyMinutes = Attendance::where('employee_id', $employeeId)
            ->thisWeek()
            ->sum('work_minutes');
        $weeklyHours = intval($weeklyMinutes / 60);
        $weeklyMins = $weeklyMinutes % 60;

        // Monthly hours
        $monthlyMinutes = Attendance::where('employee_id', $employeeId)
            ->thisMonth()
            ->sum('work_minutes');
        $monthlyHours = intval($monthlyMinutes / 60);
        $monthlyMins = $monthlyMinutes % 60;

        // Average daily (last 30 days)
        $dailyAvgMinutes = Attendance::where('employee_id', $employeeId)
            ->where('date', '>=', now()->subDays(30))
            ->avg('work_minutes') ?? 0;
        $avgHours = intval($dailyAvgMinutes / 60);
        $avgMins = intval($dailyAvgMinutes % 60);

        return [
            'weekly_hours' => sprintf('%dh %dm', $weeklyHours, $weeklyMins),
            'monthly_hours' => sprintf('%dh %dm', $monthlyHours, $monthlyMins),
            'average_daily' => sprintf('%dh %dm', $avgHours, $avgMins)
        ];
    }

    private function broadcastAttendanceUpdate($employeeId, $attendance)
    {
        // This would integrate with your WebSocket broadcasting system
        // For now, we'll just log it
        \Log::info('Broadcasting attendance update', [
            'employee_id' => $employeeId,
            'attendance_id' => $attendance->id,
            'status' => $attendance->status,
            'on_break' => $attendance->on_break
        ]);
        
        // In a real implementation, you might use Laravel Broadcasting:
        // broadcast(new AttendanceUpdated($attendance));
    }

    public function edit(Attendance $attendance)
    {
        return Inertia::render('Attendances/Edit', ['attendance' => $attendance]);
    }

    public function show(Attendance $attendance)
    {
        // Check authorization
        $this->authorize('view', $attendance);
        
        // Load relationships
        $attendance->load(['employee.user', 'editor']);
        
        // Calculate additional data
        $workDuration = $attendance->work_duration;
        $breakDuration = $attendance->break_duration;
        $totalHours = $attendance->calculateWorkMinutes();
        
        return Inertia::render('Attendances/Show', [
            'attendance' => $attendance,
            'workDuration' => $workDuration,
            'breakDuration' => $breakDuration,
            'totalMinutes' => $totalHours,
            'breakSessions' => $attendance->break_sessions ?? []
        ]);
    }

    public function update(Request $request, Attendance $attendance)
    {
        // Only HR/Admin can edit
        $this->authorize('update', $attendance);

        $validated = $request->validate([
            'clock_in' => 'required|date',
            'clock_out' => 'nullable|date|after:clock_in',
            'notes' => 'nullable|string',
        ]);

        $attendance->update($validated);
        $attendance->edited_by = Auth::id();
        $attendance->save();

        $this->logAudit('Attendance Updated', 'Updated attendance ID: ' . $attendance->id);
        return redirect()->route('attendances.index')->with('success', 'Attendance updated.');
    }

    public function destroy(Attendance $attendance)
    {
        // Only Admin can delete
        $this->authorize('delete', $attendance);

        $attendanceId = $attendance->id;
        $employeeId = $attendance->employee_id;
        
        $attendance->delete();

        $this->logAudit('Attendance Deleted', "Deleted attendance record ID: {$attendanceId} for employee ID: {$employeeId}");
        
        return redirect()->route('attendances.index')->with('success', 'Attendance record deleted successfully.');
    }

    public function export(Attendance $attendance)
    {
        // Check export permission
        $this->authorize('export', $attendance);

        $attendance->load(['employee.user']);
        
        $data = [
            'Employee' => $attendance->employee->user->name ?? 'N/A',
            'Date' => $attendance->date,
            'Clock In' => $attendance->clock_in?->format('H:i:s') ?? 'N/A',
            'Clock Out' => $attendance->clock_out?->format('H:i:s') ?? 'N/A',
            'Work Duration' => $attendance->work_duration,
            'Break Duration' => $attendance->break_duration,
            'Total Break Sessions' => count($attendance->break_sessions ?? []),
            'Status' => ucfirst($attendance->status),
            'Location' => $attendance->location ?? 'N/A',
            'IP Address' => $attendance->ip_address ?? 'N/A',
            'Notes' => $attendance->notes ?? 'N/A'
        ];

        $filename = "attendance_{$attendance->employee->user->name}_{$attendance->date}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, array_keys($data));
            
            // Add data
            fputcsv($file, array_values($data));
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function bulkExport(Request $request)
    {
        // Only HR/Admin can bulk export
        $this->authorize('viewAny', Attendance::class);

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employees,id'
        ]);

        $query = Attendance::with(['employee.user'])
            ->whereBetween('date', [$validated['start_date'], $validated['end_date']]);

        if (!empty($validated['employee_ids'])) {
            $query->whereIn('employee_id', $validated['employee_ids']);
        }

        $attendances = $query->orderBy('date')->orderBy('clock_in')->get();

        $filename = "attendance_report_{$validated['start_date']}_to_{$validated['end_date']}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($attendances) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, [
                'Employee',
                'Date',
                'Clock In',
                'Clock Out',
                'Work Duration',
                'Break Duration',
                'Break Sessions',
                'Status',
                'Location',
                'IP Address',
                'Notes'
            ]);
            
            // Add data
            foreach ($attendances as $attendance) {
                fputcsv($file, [
                    $attendance->employee->user->name ?? 'N/A',
                    $attendance->date,
                    $attendance->clock_in?->format('H:i:s') ?? 'N/A',
                    $attendance->clock_out?->format('H:i:s') ?? 'N/A',
                    $attendance->work_duration,
                    $attendance->break_duration,
                    count($attendance->break_sessions ?? []),
                    ucfirst($attendance->status),
                    $attendance->location ?? 'N/A',
                    $attendance->ip_address ?? 'N/A',
                    $attendance->notes ?? 'N/A'
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
