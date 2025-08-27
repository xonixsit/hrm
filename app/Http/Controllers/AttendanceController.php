<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Traits\AuditLogTrait;

class AttendanceController extends Controller
{
    use AuditLogTrait;

    public function index(Request $request)
    {


        // Log the employee_id if it's present in the request


        try {
            $user = Auth::user();
            $query = Attendance::with('employee.user');

        // Base query based on user role
        if (!($user->hasRole('Admin') || $user->hasRole('HR'))) {
            if ($user->employee) {
                $query->where('employee_id', $user->employee->id);
            } else {
                // If a non-Admin/HR user has no employee record, they should see no attendances
                $query->where('id', null); // Return empty result
            }
        }

        // Employee filter (Admin/HR only)
        if ($request->filled('employee_id') && ($user->hasRole('Admin') || $user->hasRole('HR'))) {
            // Convert to integer to ensure proper comparison
            $employeeId = (int) $request->employee_id;
            $query->where('employee_id', $employeeId);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Date range filters
        if ($request->filled('date_from')) {
            $query->where('date', '>=', \Carbon\Carbon::parse($request->date_from)->startOfDay());
        }
        if ($request->filled('date_to')) {
            // To include the entire day for 'date_to', we compare against the end of the day
            $query->where('date', '<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('employee.user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhere('notes', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'date');
        $sortDirection = $request->get('direction', 'desc');
        
        // Add secondary sorting to ensure consistent ordering
        if ($sortBy !== 'id') {
            $query->orderBy($sortBy, $sortDirection)->orderBy('id', 'desc');
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $attendances = $query->paginate($perPage)->withQueryString();
        
        // Calculate durations for each attendance record in the list
        $attendances->getCollection()->transform(function ($attendance) {
            $workMinutes = $attendance->calculateWorkMinutes();
            $workDuration = $attendance->work_duration;
            $breakDuration = $attendance->break_duration;
            
            // Add calculated values to the attendance object
            $attendance->work_minutes_calculated = $workMinutes;
            $attendance->work_duration_formatted = $workDuration;
            $attendance->break_duration_formatted = $breakDuration;
            
            return $attendance;
        });

        // Get filter options for Admin/HR
        $filterOptions = [];
        if ($user->hasRole('Admin') || $user->hasRole('HR')) {
            $filterOptions['employees'] = Employee::with('user')
                ->whereHas('user') // Only get employees that have users
                ->where('status', 'active') // Only active employees
                ->orderBy('id')
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->user->name,
                        'employee_code' => $employee->employee_code // Add employee code for debugging
                    ];
                })
                ->filter(function ($employee) {
                    return !empty($employee['name']); // Filter out any with empty names
                })
                ->values(); // Reset array keys
        }

        return Inertia::render('Attendances/Index', [
            'attendances' => $attendances,
            'filters' => $filterOptions,
            'queryParams' => $request->query()
        ]);
        } catch (\Exception $e) {
            Log::error('Error in AttendanceController@index: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Internal Server Error', 'message' => $e->getMessage()], 500);
        }
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
        // Check authorization
        $this->authorize('update', $attendance);
        
        // Load relationships
        $attendance->load(['employee.user']);
        
        // Calculate durations and add them to the response
        $workMinutes = $attendance->calculateWorkMinutes();
        $workDuration = $attendance->work_duration;
        $breakDuration = $attendance->break_duration;
        
        // Debug logging
        \Log::info('Attendance Edit Data', [
            'id' => $attendance->id,
            'clock_in' => $attendance->clock_in,
            'clock_out' => $attendance->clock_out,
            'total_break_minutes' => $attendance->total_break_minutes,
            'work_minutes_calculated' => $workMinutes,
            'work_duration' => $workDuration,
            'break_duration' => $breakDuration,
            'break_sessions' => $attendance->break_sessions
        ]);
        
        return Inertia::render('Attendances/Edit', [
            'attendance' => array_merge($attendance->toArray(), [
                'work_minutes_calculated' => $workMinutes,
                'work_duration_formatted' => $workDuration,
                'break_duration_formatted' => $breakDuration,
                'break_sessions_count' => count($attendance->break_sessions ?? [])
            ])
        ]);
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
