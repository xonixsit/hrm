<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Timesheet;
use App\Models\Leave;
use App\Models\Feedback;
use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first();

        $data = [];

        if (in_array($role, ['Admin', 'HR'])) {
            // Admin/HR Dashboard Data
            $totalEmployees = Employee::count();
            $pendingLeaves = Leave::where('status', 'pending')->count();
            $pendingTimesheets = Timesheet::where('status', 'pending')->count();
            $totalDepartments = Department::count();
            $activeProjects = Project::where('status', 'active')->count();

            $data['adminStats'] = [
                'totalEmployees' => $totalEmployees,
                'pendingLeaves' => $pendingLeaves,
                'totalDepartments' => $totalDepartments,
                'activeProjects' => $activeProjects,
                'employeeTrend' => $this->calculateEmployeeTrend(),
                'leaveTrend' => $this->calculateLeaveTrend(),
                'departmentTrend' => $this->calculateDepartmentTrend(),
                'projectTrend' => $this->calculateProjectTrend(),
            ];

            $data['systemActivities'] = $this->getSystemActivities();
            $data['pendingApprovals'] = $this->getPendingApprovals();
            $data['systemHealth'] = $this->getSystemHealth();
            $data['recentUserActivity'] = $this->getRecentUserActivity();

            // Legacy props for backward compatibility
            $data['totalEmployees'] = $totalEmployees;
            $data['pendingLeaves'] = $pendingLeaves;
            $data['pendingTimesheets'] = $pendingTimesheets;
            $data['recentFeedbacks'] = Feedback::with(['reviewer', 'reviewee'])->latest()->take(5)->get();

        } elseif ($role === 'Manager') {
            // Manager Dashboard Data
            $teamEmployeeIds = $user->managedEmployees->pluck('id');
            $teamSize = $teamEmployeeIds->count();
            $pendingTeamLeaves = Leave::where('status', 'pending')->whereIn('employee_id', $teamEmployeeIds)->count();
            $pendingTeamTimesheets = Timesheet::where('status', 'pending')->whereIn('employee_id', $teamEmployeeIds)->count();

            $data['managerStats'] = [
                'teamSize' => $teamSize,
                'pendingLeaves' => $pendingTeamLeaves,
                'pendingTimesheets' => $pendingTeamTimesheets,
                'teamPerformance' => 85, // Calculate based on your metrics
            ];

            $data['teamActivities'] = $this->getTeamActivities($teamEmployeeIds);
            $data['teamPerformance'] = $this->getTeamPerformance($teamEmployeeIds);
            $data['teamMembers'] = $this->getTeamMembers($teamEmployeeIds);
            $data['pendingApprovals'] = $this->getTeamPendingApprovals($teamEmployeeIds);

            // Legacy props
            $data['teamAttendances'] = Attendance::whereIn('employee_id', $teamEmployeeIds)->latest()->take(10)->get();
            $data['pendingApprovals'] = $pendingTeamLeaves + $pendingTeamTimesheets;

        } else {
            // Employee Dashboard Data
            $employeeId = $user->employee->id ?? null;
            
            if ($employeeId) {
                $myPendingLeaves = Leave::where('employee_id', $employeeId)->where('status', 'pending')->count();
                $myApprovedLeaves = Leave::where('employee_id', $employeeId)->where('status', 'approved')->count();
                $myTotalLeaves = Leave::where('employee_id', $employeeId)->count();

                // Get current attendance status
                $currentAttendance = $this->getCurrentAttendanceStatus($employeeId);

                $data['employeeStats'] = [
                    'pendingLeaves' => $myPendingLeaves,
                    'approvedLeaves' => $myApprovedLeaves,
                    'totalLeaves' => $myTotalLeaves,
                    'attendanceRate' => $this->calculateAttendanceRate($employeeId),
                    'hoursToday' => $currentAttendance['todays_summary']['total_hours'] ?? '0h 0m',
                    'tasksCompleted' => 0, // TODO: Implement task counting
                    'leaveBalance' => 25, // TODO: Calculate actual leave balance
                    'upcomingDeadlines' => 0, // TODO: Implement deadline counting
                    'taskTrend' => 0,
                ];

                // Current attendance status for ClockInOutWidget
                $data['currentAttendance'] = $currentAttendance;
                $data['clockedIn'] = $currentAttendance['clocked_in'] ?? false;

                $data['personalActivities'] = $this->getPersonalActivities($employeeId);
                $data['todaysSchedule'] = $this->getTodaysSchedule($employeeId);
                $data['myTasks'] = $this->getMyTasks($employeeId);
                $data['recentFeedback'] = $this->getRecentFeedback($user->id);

                // Legacy props
                $data['myAttendances'] = Attendance::where('employee_id', $employeeId)->latest()->take(5)->get();
                $data['myLeaves'] = Leave::where('employee_id', $employeeId)->latest()->take(5)->get();
                $data['myTimesheets'] = Timesheet::where('employee_id', $employeeId)->latest()->take(5)->get();
                $data['myFeedbacks'] = Feedback::where('reviewee_id', $user->id)->latest()->take(5)->get();
            }
        }

        return Inertia::render('Dashboard', $data);
    }

    private function calculateEmployeeTrend()
    {
        $currentMonth = Employee::whereMonth('created_at', now()->month)->count();
        $lastMonth = Employee::whereMonth('created_at', now()->subMonth()->month)->count();
        
        if ($lastMonth == 0) return 0;
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    private function calculateLeaveTrend()
    {
        $currentMonth = Leave::whereMonth('created_at', now()->month)->count();
        $lastMonth = Leave::whereMonth('created_at', now()->subMonth()->month)->count();
        
        if ($lastMonth == 0) return 0;
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    private function calculateDepartmentTrend()
    {
        $currentMonth = Department::whereMonth('created_at', now()->month)->count();
        $lastMonth = Department::whereMonth('created_at', now()->subMonth()->month)->count();
        
        if ($lastMonth == 0) return 0;
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    private function calculateProjectTrend()
    {
        $currentMonth = Project::where('status', 'active')->whereMonth('created_at', now()->month)->count();
        $lastMonth = Project::where('status', 'active')->whereMonth('created_at', now()->subMonth()->month)->count();
        
        if ($lastMonth == 0) return 0;
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    private function calculateAttendanceRate($employeeId)
    {
        $totalDays = 30; // Last 30 days
        $attendedDays = Attendance::where('employee_id', $employeeId)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        
        return $totalDays > 0 ? round(($attendedDays / $totalDays) * 100, 1) : 0;
    }

    private function getSystemActivities()
    {
        // Return recent system activities
        return [
            [
                'id' => 1,
                'type' => 'user_created',
                'title' => 'New user registered',
                'description' => 'John Doe joined the system',
                'created_at' => now()->subHours(2),
                'user' => ['name' => 'System', 'avatar' => null]
            ],
            [
                'id' => 2,
                'type' => 'leave_approved',
                'title' => 'Leave request approved',
                'description' => 'Annual leave approved for Jane Smith',
                'created_at' => now()->subHours(4),
                'user' => ['name' => 'HR Manager', 'avatar' => null]
            ]
        ];
    }

    private function getPendingApprovals()
    {
        $leaves = Leave::where('status', 'pending')
            ->with('employee.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'type' => 'leave',
                    'title' => 'Leave Request',
                    'description' => $leave->reason ?? 'Leave request pending approval',
                    'requester' => $leave->employee->user->name ?? 'Unknown',
                    'created_at' => $leave->created_at,
                ];
            });

        $timesheets = Timesheet::where('status', 'pending')
            ->with('employee.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($timesheet) {
                return [
                    'id' => $timesheet->id,
                    'type' => 'timesheet',
                    'title' => 'Timesheet Approval',
                    'description' => 'Timesheet pending approval',
                    'requester' => $timesheet->employee->user->name ?? 'Unknown',
                    'created_at' => $timesheet->created_at,
                ];
            });

        return $leaves->concat($timesheets)->sortByDesc('created_at')->take(10)->values()->all();
    }

    private function getSystemHealth()
    {
        return [
            'database' => ['status' => 'healthy', 'responseTime' => rand(20, 50)],
            'cache' => ['status' => 'healthy', 'hitRate' => rand(85, 95)],
            'queue' => ['status' => 'healthy', 'pending' => rand(0, 10)],
        ];
    }

    private function getRecentUserActivity()
    {
        return User::with('employee')
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'user' => [
                        'name' => $user->name,
                        'avatar' => null
                    ],
                    'action' => 'was active',
                    'created_at' => $user->updated_at,
                ];
            })
            ->all();
    }

    private function getTeamActivities($teamEmployeeIds)
    {
        return [];
    }

    private function getTeamPerformance($teamEmployeeIds)
    {
        return [];
    }

    private function getTeamMembers($teamEmployeeIds)
    {
        return Employee::whereIn('id', $teamEmployeeIds)
            ->with('user')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name ?? 'Unknown',
                    'position' => $employee->position ?? 'Employee',
                    'avatar' => null,
                ];
            })
            ->all();
    }

    private function getTeamPendingApprovals($teamEmployeeIds)
    {
        return [];
    }

    private function getPersonalActivities($employeeId)
    {
        return [];
    }

    private function getTodaysSchedule($employeeId)
    {
        return [];
    }

    private function getMyTasks($employeeId)
    {
        return [];
    }

    private function getRecentFeedback($userId)
    {
        return Feedback::where('reviewee_id', $userId)
            ->with('reviewer')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($feedback) {
                return [
                    'id' => $feedback->id,
                    'content' => $feedback->feedback,
                    'reviewer' => $feedback->reviewer->name ?? 'Anonymous',
                    'created_at' => $feedback->created_at,
                ];
            })
            ->all();
    }

    private function getCurrentAttendanceStatus($employeeId)
    {
        $today = now()->format('Y-m-d');
        $attendance = Attendance::where('employee_id', $employeeId)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            return [
                'clocked_in' => false,
                'on_break' => false,
                'clock_in_time' => null,
                'todays_summary' => $this->getTodaysSummary($employeeId),
                'recent_activities' => $this->getRecentActivities($employeeId),
                'stats' => $this->getAttendanceStats($employeeId)
            ];
        }

        return [
            'clocked_in' => $attendance->isClockedIn(),
            'on_break' => $attendance->on_break,
            'clock_in_time' => $attendance->clock_in?->toISOString(),
            'current_break_start' => $attendance->current_break_start?->toISOString(),
            'break_sessions' => $attendance->break_sessions ?? [],
            'current_session' => $attendance,
            'todays_summary' => $this->getTodaysSummary($employeeId),
            'recent_activities' => $this->getRecentActivities($employeeId),
            'stats' => $this->getAttendanceStats($employeeId)
        ];
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
            'total_hours' => $attendance->work_duration ?? '0h 0m',
            'break_time' => $attendance->break_duration ?? '0h 0m',
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
            ->where('date', '>=', now()->startOfWeek())
            ->sum('work_minutes');
        $weeklyHours = intval($weeklyMinutes / 60);
        $weeklyMins = $weeklyMinutes % 60;

        // Monthly hours
        $monthlyMinutes = Attendance::where('employee_id', $employeeId)
            ->where('date', '>=', now()->startOfMonth())
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
}
