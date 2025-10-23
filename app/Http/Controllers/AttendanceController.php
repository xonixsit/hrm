<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Timesheet;
use App\Models\Project;
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
        
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'No employee record found for this user.'
            ], 400);
        }
        
        $today = now()->format('Y-m-d');
        
        // Check if already clocked in today - use database lock to prevent race conditions
        $existing = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->lockForUpdate()
            ->first();
            
        if ($existing) {
            // If record exists and is not clocked out, prevent new clock-in
            if ($existing->status !== 'clocked_out') {
                return response()->json([
                    'success' => false,
                    'message' => 'Already clocked in today.',
                    'attendance' => $existing
                ], 400);
            }
            
            // If clocked out, update the existing record instead of creating new one
            $existing->update([
                'clock_in' => now(),
                'clock_out' => null,
                'status' => 'clocked_in',
                'on_break' => false,
                'total_break_minutes' => 0,
                'break_sessions' => [],
                'work_minutes' => null,
                'ip_address' => $request->ip(),
                'location' => $request->input('location'),
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
                'location_verified' => $request->input('latitude') && $request->input('longitude')
            ]);
            
            $this->logAudit('Attendance Clock In', 'Re-clocked in for employee ID: ' . $employee->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Clocked in successfully.',
                'attendance' => $existing->fresh(),
                'clock_in_time' => $existing->clock_in->toISOString()
            ]);
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
        
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'No employee record found for this user.'
            ], 400);
        }
        
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

        // Synchronize with timesheet
        $timesheetResult = $this->syncAttendanceToTimesheet($attendance);

        $this->logAudit('Attendance Clock Out', 'Clocked out for employee ID: ' . $employee->id);
        
        // Broadcast real-time update
        $this->broadcastAttendanceUpdate($employee->id, $attendance);
        
        $message = 'Clocked out successfully.';
        if ($timesheetResult['created']) {
            $message .= " Timesheet entry created automatically ({$timesheetResult['hours']} hours).";
        } elseif ($timesheetResult['updated'] ?? false) {
            $message .= " Existing timesheet updated ({$timesheetResult['hours']} hours).";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'attendance' => $attendance,
            'work_duration' => $attendance->work_duration,
            'break_duration' => $attendance->break_duration,
            'timesheet_sync' => $timesheetResult
        ]);
    }

    public function startBreak(Request $request)
    {
        $employee = Auth::user()->employee;
        
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'No employee record found for this user.'
            ], 400);
        }
        
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
        
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'No employee record found for this user.'
            ], 400);
        }
        
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
        
        if (!$employee) {
            return response()->json([
                'clocked_in' => false,
                'on_break' => false,
                'clock_in_time' => null,
                'error' => 'No employee record found for this user.'
            ]);
        }
        
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

        // Convert datetime strings to proper timezone
        if (isset($validated['clock_in'])) {
            $validated['clock_in'] = \Carbon\Carbon::parse($validated['clock_in'])->setTimezone(config('app.timezone'));
        }
        
        if (isset($validated['clock_out'])) {
            $validated['clock_out'] = \Carbon\Carbon::parse($validated['clock_out'])->setTimezone(config('app.timezone'));
        }

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

    /**
     * Synchronize attendance record with timesheet entry
     */
    private function syncAttendanceToTimesheet(Attendance $attendance)
    {
        try {
            // Only sync if employee has clocked out (complete work session)
            if (!$attendance->clock_out || $attendance->status !== 'clocked_out') {
                return ['created' => false, 'message' => 'Attendance not complete'];
            }

            // Check if timesheet entry already exists for this date
            $existingTimesheet = Timesheet::where('employee_id', $attendance->employee_id)
                ->whereDate('date', $attendance->date)
                ->first();

            // Calculate hours worked (convert minutes to hours with 2 decimal places)
            $hoursWorked = round($attendance->work_minutes / 60, 2);

            // Get default project (you might want to make this configurable)
            $defaultProject = Project::where('is_default', true)->first() 
                ?? Project::first(); // Fallback to first project if no default

            if (!$defaultProject) {
                Log::warning('No default project found for timesheet sync', [
                    'attendance_id' => $attendance->id,
                    'employee_id' => $attendance->employee_id
                ]);
                return ['created' => false, 'message' => 'No default project available'];
            }

            if ($existingTimesheet) {
                // Update existing timesheet with attendance data
                $existingTimesheet->update([
                    'hours' => $hoursWorked,
                    'description' => $this->generateTimesheetDescription($attendance),
                    'status' => 'pending' // Reset to pending if it was previously approved
                ]);

                Log::info('Updated existing timesheet from attendance', [
                    'timesheet_id' => $existingTimesheet->id,
                    'attendance_id' => $attendance->id,
                    'hours' => $hoursWorked
                ]);

                return [
                    'created' => false,
                    'updated' => true,
                    'timesheet_id' => $existingTimesheet->id,
                    'hours' => $hoursWorked,
                    'message' => 'Existing timesheet updated'
                ];
            } else {
                // Create new timesheet entry
                $timesheet = Timesheet::create([
                    'employee_id' => $attendance->employee_id,
                    'project_id' => $defaultProject->id,
                    'task_id' => null, // No specific task by default
                    'date' => $attendance->date,
                    'hours' => $hoursWorked,
                    'description' => $this->generateTimesheetDescription($attendance),
                    'status' => 'pending'
                ]);

                Log::info('Created new timesheet from attendance', [
                    'timesheet_id' => $timesheet->id,
                    'attendance_id' => $attendance->id,
                    'hours' => $hoursWorked
                ]);

                return [
                    'created' => true,
                    'timesheet_id' => $timesheet->id,
                    'hours' => $hoursWorked,
                    'message' => 'New timesheet created'
                ];
            }

        } catch (\Exception $e) {
            Log::error('Failed to sync attendance to timesheet', [
                'attendance_id' => $attendance->id,
                'employee_id' => $attendance->employee_id,
                'error' => $e->getMessage()
            ]);

            return [
                'created' => false,
                'error' => true,
                'message' => 'Sync failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate a description for the timesheet based on attendance data
     */
    private function generateTimesheetDescription(Attendance $attendance)
    {
        $clockIn = $attendance->clock_in->format('H:i');
        $clockOut = $attendance->clock_out->format('H:i');
        $workDuration = $attendance->work_duration;
        $breakDuration = $attendance->break_duration;
        $breakSessions = count($attendance->break_sessions ?? []);

        $description = "Tax services work - Auto-generated from attendance tracking\n";
        $description .= "Work session: {$clockIn} - {$clockOut} ({$workDuration})";
        
        if ($breakSessions > 0) {
            $description .= "\nBreak time: {$breakDuration} ({$breakSessions} session" . ($breakSessions > 1 ? 's' : '') . ")";
        }

        $description .= "\n\nActivities may include: Tax preparation, client consultations, filing services, bookkeeping, or administrative tasks";

        if ($attendance->location) {
            $description .= "\nWork location: {$attendance->location}";
        }

        if ($attendance->notes) {
            $description .= "\nAdditional notes: {$attendance->notes}";
        }

        return $description;
    }

    /**
     * Manual clock out for forgotten clock outs
     */
    public function manualClockOut(Request $request)
    {
        $validated = $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
            'clock_out_time' => 'required|date',
            'reason' => 'required|string|min:10|max:500'
        ]);

        $attendance = Attendance::findOrFail($validated['attendance_id']);
        
        // Check authorization - only HR/Admin can manually clock out others
        if (!Auth::user()->hasRole(['Admin', 'HR']) && $attendance->employee_id !== Auth::user()->employee?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to perform this action.'
            ], 403);
        }

        // Ensure attendance is not already clocked out
        if ($attendance->clock_out) {
            return response()->json([
                'success' => false,
                'message' => 'Employee is already clocked out.'
            ], 400);
        }

        // Validate clock out time is after clock in
        $clockOutTime = \Carbon\Carbon::parse($validated['clock_out_time']);
        if ($clockOutTime->lte($attendance->clock_in)) {
            return response()->json([
                'success' => false,
                'message' => 'Clock out time must be after clock in time.'
            ], 400);
        }

        // Validate clock out time is not in the future
        // Allow clock out up to current time if today, or end of day for any day up to today
        $attendanceDate = \Carbon\Carbon::parse($attendance->date);
        $today = now()->startOfDay();
        $clockOutDate = $clockOutTime->copy()->startOfDay();
        
        // Clock out time cannot be in the future
        if ($clockOutTime->gt(now())) {
            return response()->json([
                'success' => false,
                'message' => 'Clock out time cannot be in the future.'
            ], 400);
        }
        
        // Clock out date cannot be before the attendance date
        if ($clockOutDate->lt($attendanceDate->startOfDay())) {
            return response()->json([
                'success' => false,
                'message' => 'Clock out date cannot be before the clock in date (' . $attendanceDate->format('Y-m-d') . ').'
            ], 400);
        }
        
        // Clock out date cannot be after today
        if ($clockOutDate->gt($today)) {
            return response()->json([
                'success' => false,
                'message' => 'Clock out date cannot be in the future.'
            ], 400);
        }

        // End any active break
        if ($attendance->on_break) {
            $attendance->endBreak();
        }

        // Calculate work minutes up to the manual clock out time
        $workMinutes = $attendance->calculateWorkMinutes();

        // Update attendance record
        $attendance->update([
            'clock_out' => $clockOutTime,
            'status' => 'clocked_out',
            'notes' => ($attendance->notes ? $attendance->notes . "\n\n" : '') . 
                      "Manual clock out by " . Auth::user()->name . " at " . now()->format('Y-m-d H:i:s') . 
                      "\nReason: " . $validated['reason'],
            'edited_by' => Auth::id()
        ]);

        // Recalculate work minutes after setting clock_out
        $attendance->update(['work_minutes' => $attendance->calculateWorkMinutes()]);

        // Synchronize with timesheet
        $timesheetResult = $this->syncAttendanceToTimesheet($attendance);

        $this->logAudit('Manual Clock Out', 
            "Manual clock out for attendance ID: {$attendance->id}, Employee ID: {$attendance->employee_id}. Reason: {$validated['reason']}"
        );

        $message = 'Manual clock out completed successfully.';
        if ($timesheetResult['created']) {
            $message .= " Timesheet entry created automatically ({$timesheetResult['hours']} hours).";
        } elseif ($timesheetResult['updated'] ?? false) {
            $message .= " Existing timesheet updated ({$timesheetResult['hours']} hours).";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'attendance' => $attendance->fresh(),
            'work_duration' => $attendance->work_duration,
            'break_duration' => $attendance->break_duration,
            'timesheet_sync' => $timesheetResult
        ]);
    }

    /**
     * Get or create default project for timesheet sync (Tax Services)
     */
    private function getDefaultProjectForTimesheet()
    {
        // Try to get a project marked as default
        $defaultProject = Project::where('is_default', true)->first();
        
        if (!$defaultProject) {
            // If no default project, try to get a tax-related project
            $defaultProject = Project::where('name', 'LIKE', '%tax%')
                ->orWhere('name', 'LIKE', '%filing%')
                ->orWhere('name', 'LIKE', '%preparation%')
                ->first();
        }

        if (!$defaultProject) {
            // Create a default project if none exists for tax services company
            $defaultProject = Project::create([
                'name' => 'Tax Preparation & Filing Services',
                'description' => 'Default project for tax preparation, filing services, client consultations, and general tax-related work activities',
                'client' => 'Internal Operations',
                'status' => 'active',
                'is_default' => true,
                'priority' => 'high'
            ]);
        }

        return $defaultProject;
    }
}
