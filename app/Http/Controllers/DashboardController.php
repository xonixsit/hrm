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
use App\Models\CompetencyAssessment;
use App\Models\AssessmentCycle;
use App\Services\BirthdayService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected BirthdayService $birthdayService;

    public function __construct(BirthdayService $birthdayService)
    {
        $this->birthdayService = $birthdayService;
    }

    public function index()
    {
        try {
            $user = Auth::user();
            
            // Get user role safely
            $role = 'Employee'; // Default role
            try {
                $userRoles = $user->getRoleNames();
                $role = $userRoles->first() ?? 'Employee';
            } catch (\Exception $e) {
                Log::error('Error getting user roles: ' . $e->getMessage());
            }

            // Start with minimal data structure
            $data = [
                'birthdayData' => [
                    'todaysBirthdays' => [],
                    'upcomingBirthdays' => [],
                    'stats' => ['total' => 0, 'this_month' => 0, 'next_month' => 0],
                    'currentUserBirthday' => null,
                ]
            ];

            // Add birthday data for all users
            try {
                $todaysBirthdays = $this->birthdayService->getTodaysBirthdays();
                
                // Check if current user has birthday today
                $currentUserBirthday = null;
                if ($user->employee) {
                    $currentUserBirthday = $todaysBirthdays->firstWhere('user_id', $user->id);
                }
                
                $data['birthdayData'] = [
                    'todaysBirthdays' => $todaysBirthdays->map(function ($employee) {
                        try {
                            return [
                                'id' => $employee->id,
                                'user' => [
                                    'name' => $employee->user->name ?? 'Unknown',
                                    'email' => $employee->user->email ?? 'unknown@example.com',
                                ],
                                'job_title' => $employee->job_title ?? 'N/A',
                                'department' => $employee->department ? $employee->department->name : null,
                                'age' => $employee->getAge(),
                            ];
                        } catch (\Exception $e) {
                            Log::error('Error mapping birthday employee: ' . $e->getMessage());
                            return [
                                'id' => $employee->id ?? 0,
                                'user' => ['name' => 'Unknown', 'email' => 'unknown@example.com'],
                                'job_title' => 'N/A',
                                'department' => null,
                                'age' => null,
                            ];
                        }
                    }),
                    'upcomingBirthdays' => (function() {
                        try {
                            return $this->birthdayService->getUpcomingBirthdays(7);
                        } catch (\Exception $e) {
                            Log::error('Error getting upcoming birthdays: ' . $e->getMessage());
                            return collect();
                        }
                    })()->map(function ($birthday) {
                        return [
                            'employee' => [
                                'id' => $birthday['employee']->id,
                                'user' => [
                                    'name' => $birthday['employee']->user->name,
                                    'email' => $birthday['employee']->user->email,
                                ],
                                'job_title' => $birthday['employee']->job_title,
                                'department' => $birthday['employee']->department ? $birthday['employee']->department->name : null,
                            ],
                            'birthday_date' => $birthday['birthday_date']->toISOString(),
                            'days_until' => $birthday['days_until'],
                        ];
                    }),
                    'stats' => (function() {
                        try {
                            return $this->birthdayService->getBirthdayStats();
                        } catch (\Exception $e) {
                            Log::error('Error getting birthday stats: ' . $e->getMessage());
                            return ['total' => 0, 'this_month' => 0, 'next_month' => 0];
                        }
                    })(),
                    'currentUserBirthday' => $currentUserBirthday ? [
                        'id' => $currentUserBirthday->id,
                        'user' => [
                            'name' => $currentUserBirthday->user->name,
                            'email' => $currentUserBirthday->user->email,
                        ],
                        'job_title' => $currentUserBirthday->job_title,
                        'department' => $currentUserBirthday->department ? $currentUserBirthday->department->name : null,
                        'age' => $currentUserBirthday->getAge(),
                    ] : null,
                ];
            } catch (\Exception $e) {
                Log::error('Error getting birthday data: ' . $e->getMessage());
            }

        if (in_array($role, ['Admin', 'HR'])) {
            // Admin/HR Dashboard Data
            $totalEmployees = Employee::count();
            $pendingLeaves = Leave::where('status', 'pending')->count();
            $pendingTimesheets = Timesheet::where('status', 'pending')->count();
            $totalDepartments = Department::count();
            $activeProjects = Project::where('status', 'active')->count();

            // Competency metrics for admin
            $pendingAssessments = CompetencyAssessment::where('status', 'submitted')->count();
            $activeAssessmentCycles = AssessmentCycle::where('status', 'active')->count();
            $completedAssessmentsThisMonth = CompetencyAssessment::where('status', 'approved')
                ->whereMonth('updated_at', now()->month)
                ->count();
            
            // Calculate average rating across all approved assessments
            $averageRating = CompetencyAssessment::where('status', 'approved')
                ->whereNotNull('rating')
                ->avg('rating');

            // Performance metrics
            $attendanceRate = $this->calculateAttendanceRate();
            $workReportsData = $this->getWorkReportsMetrics();
            $performanceData = $this->getPerformanceMetrics();

            // Get attendance tracking data
            $attendanceTracking = $this->getAttendanceTrackingData();
            
            // Get break violations data
            $breakViolations = $this->getBreakViolations();
            Log::info('Break violations found: ' . count($breakViolations));

            $data['adminStats'] = [
                'totalEmployees' => $totalEmployees,
                'pendingLeaves' => $pendingLeaves,
                'totalDepartments' => $totalDepartments,
                'activeProjects' => $activeProjects,
                'pendingAssessments' => $pendingAssessments,
                'activeAssessmentCycles' => $activeAssessmentCycles,
                'completedAssessmentsThisMonth' => $completedAssessmentsThisMonth,
                'averageRating' => $averageRating ? round($averageRating, 1) : null,
                'employeeTrend' => $this->calculateEmployeeTrend(),
                'leaveTrend' => $this->calculateLeaveTrend(),
                'departmentTrend' => $this->calculateDepartmentTrend(),
                'projectTrend' => $this->calculateProjectTrend(),
                'assessmentTrend' => $this->calculateAssessmentTrend(),
                'systemUptime' => 99.8,
                'systemHealth' => 98,
                // Performance metrics
                'attendanceRate' => $attendanceRate['rate'],
                'attendanceTrend' => $attendanceRate['trend'],
                'workReportsCount' => $workReportsData['count'],
                'workReportsTrend' => $workReportsData['trend'],
                'successfulCalls' => $workReportsData['successfulCalls'],
                'successfulCallsTrend' => $workReportsData['callsTrend'],
                'avgPerformanceScore' => $performanceData['avgScore'],
                'performanceTrend' => $performanceData['trend'],
                // Attendance tracking
                'clockedInCount' => $attendanceTracking['clockedInCount'],
                'missedClockInCount' => $attendanceTracking['missedClockInCount'],
                'totalEmployeeCount' => $attendanceTracking['totalEmployeeCount'],
            ];

            $data['systemActivities'] = $this->getSystemActivities();
            $data['pendingApprovals'] = $this->getPendingApprovals();
            $data['systemHealth'] = $this->getSystemHealth();
            $data['recentUserActivity'] = $this->getRecentUserActivity();
            $data['attendanceTracking'] = $attendanceTracking;
            $data['breakViolations'] = $breakViolations;

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
            
            // Team competency metrics
            $teamPendingAssessments = CompetencyAssessment::where('status', 'submitted')
                ->whereIn('employee_id', $teamEmployeeIds)
                ->count();
            $teamCompletedAssessments = CompetencyAssessment::where('status', 'approved')
                ->whereIn('employee_id', $teamEmployeeIds)
                ->whereMonth('updated_at', now()->month)
                ->count();

            $data['managerStats'] = [
                'teamSize' => $teamSize,
                'pendingLeaves' => $pendingTeamLeaves,
                'pendingTimesheets' => $pendingTeamTimesheets,
                'teamPendingAssessments' => $teamPendingAssessments,
                'teamCompletedAssessments' => $teamCompletedAssessments,
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

                // Get current attendance status - use same logic as API
                $currentAttendance = $this->getCurrentAttendanceStatus($employeeId);

                // Employee competency metrics
                $myPendingAssessments = CompetencyAssessment::where('employee_id', $employeeId)
                    ->whereIn('status', ['draft', 'submitted'])
                    ->count();
                $myCompletedAssessments = CompetencyAssessment::where('employee_id', $employeeId)
                    ->where('status', 'submitted')
                    ->count();
                $myAverageRating = CompetencyAssessment::where('employee_id', $employeeId)
                    ->where('status', 'submitted')
                    ->whereNotNull('rating')
                    ->avg('rating');

                // Employee work report metrics
                $myWorkReports = DB::table('work_reports')
                    ->where('employee_id', $employeeId)
                    ->whereMonth('created_at', now()->month)
                    ->count();
                
                // Calculate successful calls from work reports this month
                $mySuccessfulCalls = DB::table('work_reports')
                    ->where('employee_id', $employeeId)
                    ->whereMonth('created_at', now()->month)
                    ->sum('successful_calls');

                // Journey & Growth metrics
                $journeyMetrics = $this->getEmployeeJourneyMetrics($employeeId);
                $growthMetrics = $this->getEmployeeGrowthMetrics($employeeId);
                $achievementMetrics = $this->getEmployeeAchievements($employeeId);

                $data['employeeStats'] = [
                    // Core Performance
                    'attendanceRate' => $this->calculateEmployeeAttendanceRate($employeeId),
                    'hoursToday' => $currentAttendance['todays_summary']['total_hours'] ?? '0h 0m',
                    'myWorkReports' => $myWorkReports,
                    'mySuccessfulCalls' => $mySuccessfulCalls,
                    
                    // Leave Management
                    'pendingLeaves' => $myPendingLeaves,
                    'approvedLeaves' => $myApprovedLeaves,
                    'leaveBalance' => $this->calculateLeaveBalance($employeeId),
                    
                    // Growth & Development
                    'myPendingAssessments' => $myPendingAssessments,
                    'myCompletedAssessments' => $myCompletedAssessments,
                    'myAverageRating' => $myAverageRating ? round($myAverageRating, 1) : null,
                    'skillsGrowth' => $growthMetrics['skillsGrowth'],
                    'competencyProgress' => $growthMetrics['competencyProgress'],
                    
                    // Journey Milestones
                    'daysWithCompany' => $journeyMetrics['daysWithCompany'],
                    'monthsWithCompany' => $journeyMetrics['monthsWithCompany'],
                    'yearsOfService' => $journeyMetrics['yearsOfService'],
                    'totalWorkHours' => $journeyMetrics['totalWorkHours'],
                    'projectsContributed' => $journeyMetrics['projectsContributed'],
                    
                    // Achievements & Recognition
                    'totalAchievements' => $achievementMetrics['totalAchievements'],
                    'recentAchievements' => $achievementMetrics['recentAchievements'],
                    'performanceRank' => $achievementMetrics['performanceRank'],
                    'consistencyScore' => $achievementMetrics['consistencyScore'],
                    
                    // Trends
                    'attendanceTrend' => $journeyMetrics['attendanceTrend'],
                    'performanceTrend' => $growthMetrics['performanceTrend'],
                    'productivityTrend' => $journeyMetrics['productivityTrend'],
                ];

                // Current attendance status for ClockInOutWidget
                $data['currentAttendance'] = $currentAttendance;
                $data['clockedIn'] = $currentAttendance['clocked_in'] ?? false;

                $data['personalActivities'] = $this->getPersonalActivities($employeeId);
                $data['myTasks'] = $this->getMyTasks($employeeId);
                $data['recentFeedback'] = $this->getRecentFeedback($user->id);

                // Legacy props
                $data['myAttendances'] = Attendance::where('employee_id', $employeeId)->latest()->take(5)->get();
                $data['myLeaves'] = Leave::where('employee_id', $employeeId)->latest()->take(5)->get();
                $data['myTimesheets'] = Timesheet::where('employee_id', $employeeId)->latest()->take(5)->get();
                $data['myFeedbacks'] = Feedback::where('reviewee_id', $user->id)->latest()->take(5)->get();
            } else {
                // User has no employee record - provide default attendance data
                $data['currentAttendance'] = [
                    'clocked_in' => false,
                    'on_break' => false,
                    'clock_in_time' => null,
                    'todays_summary' => [
                        'total_hours' => '0h 0m',
                        'break_time' => '0h 0m',
                        'sessions' => 0,
                        'clock_ins' => 0
                    ],
                    'recent_activities' => [],
                    'stats' => []
                ];
                $data['clockedIn'] = false;
                
                // Empty collections for users without employee records
                $data['myAttendances'] = collect();
                $data['myLeaves'] = collect();
                $data['myTimesheets'] = collect();
                $data['myFeedbacks'] = collect();
                $data['personalActivities'] = [];
                $data['myTasks'] = [];
                $data['recentFeedback'] = [];
            }
        }

        return Inertia::render('Dashboard', $data);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            return Inertia::render('Dashboard', [
                'birthdayData' => [
                    'todaysBirthdays' => [],
                    'upcomingBirthdays' => [],
                    'stats' => ['total' => 0, 'this_month' => 0, 'next_month' => 0],
                    'currentUserBirthday' => null,
                ],
                'currentAttendance' => [
                    'clocked_in' => false,
                    'on_break' => false,
                    'clock_in_time' => null,
                    'todays_summary' => [
                        'total_hours' => '0h 0m',
                        'break_time' => '0h 0m',
                        'sessions' => 0,
                        'clock_ins' => 0
                    ],
                    'recent_activities' => [],
                    'stats' => []
                ],
                'clockedIn' => false,
                'employeeStats' => [
                    'attendanceRate' => 0,
                    'hoursToday' => '0h 0m',
                    'myWorkReports' => 0,
                    'mySuccessfulCalls' => 0,
                    'pendingLeaves' => 0,
                    'approvedLeaves' => 0,
                    'leaveBalance' => 0,
                    'myPendingAssessments' => 0,
                    'myCompletedAssessments' => 0,
                    'myAverageRating' => null,
                    'skillsGrowth' => 0,
                    'competencyProgress' => 0,
                    'daysWithCompany' => 0,
                    'monthsWithCompany' => 0,
                    'yearsOfService' => 0,
                    'totalWorkHours' => 0,
                    'projectsContributed' => 0,
                    'totalAchievements' => 0,
                    'recentAchievements' => [],
                    'performanceRank' => 'N/A',
                    'consistencyScore' => 0,
                    'attendanceTrend' => 0,
                    'performanceTrend' => 0,
                    'productivityTrend' => 0,
                ]
            ]);
        }
    }

    private function getAttendanceTrackingData()
    {
        try {
            // Get all active employees with Employee role
            $employeeRoleEmployees = Employee::active()
                ->whereHas('user', function($query) {
                    $query->whereHas('roles', function($roleQuery) {
                        $roleQuery->whereIn('name', ['Employee', 'employee']); // Case insensitive
                    });
                })
                ->with(['user', 'department'])
                ->get();

            // If no employees found with Employee role, get all active employees
            if ($employeeRoleEmployees->isEmpty()) {
                $employeeRoleEmployees = Employee::active()
                    ->with(['user', 'department'])
                    ->get();
                \Log::warning('No employees found with Employee role, using all active employees');
            }

            $totalEmployeeCount = $employeeRoleEmployees->count();

            // Debug: Check for specific employee "Riyanshi"
            $riyanshiEmployee = Employee::whereHas('user', function($query) {
                $query->where('name', 'like', '%Riyanshi%');
            })->with(['user', 'user.roles'])->first();

            if ($riyanshiEmployee) {
                \Log::info('Riyanshi Employee Debug', [
                    'employee_id' => $riyanshiEmployee->id,
                    'employee_name' => $riyanshiEmployee->user->name,
                    'employee_status' => $riyanshiEmployee->status,
                    'is_active' => $riyanshiEmployee->status === 'active',
                    'user_roles' => $riyanshiEmployee->user->roles->pluck('name')->toArray(),
                    'has_employee_role' => $riyanshiEmployee->user->hasRole(['Employee', 'employee']),
                ]);
            }

            // Debug: Log employee role filtering
            \Log::info('Attendance Tracking Debug', [
                'total_active_employees' => Employee::active()->count(),
                'employees_with_employee_role' => $totalEmployeeCount,
                'employee_role_employee_ids' => $employeeRoleEmployees->pluck('id')->toArray(),
                'employee_role_employee_names' => $employeeRoleEmployees->pluck('user.name')->toArray(),
            ]);

            // Get today's attendance records for these employees
            $today = today();
            $todaysAttendances = Attendance::whereDate('date', $today)
                ->whereIn('employee_id', $employeeRoleEmployees->pluck('id'))
                ->get()
                ->keyBy('employee_id');

            // Fallback: If no attendance found for today, check last 24 hours
            if ($todaysAttendances->isEmpty()) {
                $todaysAttendances = Attendance::where('created_at', '>=', now()->subHours(24))
                    ->whereIn('employee_id', $employeeRoleEmployees->pluck('id'))
                    ->get()
                    ->keyBy('employee_id');
                
                \Log::info('Using 24-hour fallback for attendance', [
                    'fallback_count' => $todaysAttendances->count()
                ]);
            }

            // Debug: Log timezone and date information
            \Log::info('Timezone and Date Debug', [
                'app_timezone' => config('app.timezone'),
                'server_timezone' => date_default_timezone_get(),
                'today_date' => $today->toDateString(),
                'today_datetime' => $today->toDateTimeString(),
                'now_datetime' => now()->toDateTimeString(),
                'carbon_now' => \Carbon\Carbon::now()->toDateTimeString(),
                'php_date' => date('Y-m-d H:i:s'),
            ]);

            // Also check all recent attendance records (last 3 days) to understand the data
            $recentAttendances = Attendance::where('date', '>=', now()->subDays(3)->toDateString())
                ->with(['employee.user'])
                ->get();
            
            \Log::info('Recent Attendance Analysis', [
                'today_date' => $today->toDateString(),
                'recent_attendance_count' => $recentAttendances->count(),
                'recent_attendance_details' => $recentAttendances->map(function($att) {
                    return [
                        'id' => $att->id,
                        'employee_id' => $att->employee_id,
                        'employee_name' => $att->employee && $att->employee->user ? $att->employee->user->name : 'Unknown',
                        'date' => $att->date,
                        'date_matches_today' => $att->date === today()->toDateString(),
                        'clock_in' => $att->clock_in ? $att->clock_in->toDateTimeString() : null,
                        'clock_out' => $att->clock_out ? $att->clock_out->toDateTimeString() : null,
                        'is_clocked_in' => $att->clock_in && !$att->clock_out,
                    ];
                })->toArray(),
            ]);

            // Debug: Log attendance records
            \Log::info('Today\'s Attendance Records', [
                'total_attendance_records' => $todaysAttendances->count(),
                'attendance_employee_ids' => $todaysAttendances->keys()->toArray(),
                'attendance_details' => $todaysAttendances->map(function($att) {
                    return [
                        'employee_id' => $att->employee_id,
                        'clock_in' => $att->clock_in ? $att->clock_in->toDateTimeString() : null,
                        'clock_out' => $att->clock_out ? $att->clock_out->toDateTimeString() : null,
                        'has_clock_in' => !is_null($att->clock_in),
                        'has_clock_out' => !is_null($att->clock_out),
                    ];
                })->toArray(),
            ]);

            // Count clocked in employees (those with clock_in but no clock_out today)
            $clockedInCount = $todaysAttendances->filter(function($attendance) {
                return $attendance->clock_in && !$attendance->clock_out;
            })->count();

            // Debug: Log attendance filtering details
            \Log::info('Attendance Filtering Debug', [
                'total_employees_with_role' => $employeeRoleEmployees->count(),
                'total_todays_attendances' => $todaysAttendances->count(),
                'clocked_in_count' => $clockedInCount,
                'attendance_details' => $todaysAttendances->map(function($att) {
                    return [
                        'employee_id' => $att->employee_id,
                        'date' => $att->date,
                        'clock_in' => $att->clock_in ? $att->clock_in->toDateTimeString() : null,
                        'clock_out' => $att->clock_out ? $att->clock_out->toDateTimeString() : null,
                        'has_clock_in' => !is_null($att->clock_in),
                        'has_clock_out' => !is_null($att->clock_out),
                        'is_clocked_in' => $att->clock_in && !$att->clock_out,
                    ];
                })->toArray(),
            ]);

            // Get employees who missed clocking in today
            $missedClockInEmployees = $employeeRoleEmployees->filter(function($employee) use ($todaysAttendances) {
                return !$todaysAttendances->has($employee->id);
            })->map(function($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                    'email' => $employee->user->email,
                    'job_title' => $employee->job_title,
                    'department' => $employee->department ? $employee->department->name : 'No Department',
                    'employee_code' => $employee->employee_code,
                ];
            })->values();

            // Get currently clocked in employees
            $clockedInEmployees = $employeeRoleEmployees->filter(function($employee) use ($todaysAttendances) {
                $attendance = $todaysAttendances->get($employee->id);
                return $attendance && $attendance->clock_in && !$attendance->clock_out;
            })->map(function($employee) use ($todaysAttendances) {
                $attendance = $todaysAttendances->get($employee->id);
                $workDuration = $attendance->getCurrentSessionDuration();
                
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                    'email' => $employee->user->email,
                    'job_title' => $employee->job_title,
                    'department' => $employee->department ? $employee->department->name : 'No Department',
                    'employee_code' => $employee->employee_code,
                    'clock_in_time' => $attendance->clock_in ? $attendance->clock_in->toISOString() : null,
                    'work_duration' => $workDuration,
                    'on_break' => $attendance->on_break ?? false,
                ];
            })->values();

            $missedClockInCount = $missedClockInEmployees->count();

            return [
                'totalEmployeeCount' => $totalEmployeeCount,
                'clockedInCount' => $clockedInCount,
                'missedClockInCount' => $missedClockInCount,
                'clockedInEmployees' => $clockedInEmployees,
                'missedClockInEmployees' => $missedClockInEmployees,
                'attendanceRate' => $totalEmployeeCount > 0 ? round(($clockedInCount / $totalEmployeeCount) * 100, 1) : 0,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting attendance tracking data: ' . $e->getMessage());
            return [
                'totalEmployeeCount' => 0,
                'clockedInCount' => 0,
                'missedClockInCount' => 0,
                'clockedInEmployees' => [],
                'missedClockInEmployees' => [],
                'attendanceRate' => 0,
            ];
        }
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

    private function calculateAssessmentTrend()
    {
        $currentMonth = CompetencyAssessment::where('status', 'approved')->whereMonth('updated_at', now()->month)->count();
        $lastMonth = CompetencyAssessment::where('status', 'approved')->whereMonth('updated_at', now()->subMonth()->month)->count();
        
        if ($lastMonth == 0) return 0;
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    private function calculateSystemUptime()
    {
        // Calculate uptime based on system availability
        // For demo purposes, using a realistic calculation
        $uptimePercentage = 99.5 - (rand(0, 50) / 100); // Random between 99.0% and 99.5%
        return round($uptimePercentage, 1);
    }

    private function calculateSystemHealthPercentage()
    {
        // Calculate system health based on various factors
        $dbHealth = $this->checkDatabaseHealth();
        $cacheHealth = $this->checkCacheHealth();
        $queueHealth = $this->checkQueueHealth();
        
        // Average health score
        $overallHealth = ($dbHealth + $cacheHealth + $queueHealth) / 3;
        return round($overallHealth, 1);
    }

    private function checkDatabaseHealth()
    {
        try {
            // Simple DB check - count users table
            DB::table('users')->count();
            return 100; // Healthy
        } catch (\Exception $e) {
            return 0; // Unhealthy
        }
    }

    private function checkCacheHealth()
    {
        try {
            // Check if cache is working
            cache()->put('health_check', 'ok', 60);
            $result = cache()->get('health_check');
            return $result === 'ok' ? 100 : 50;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function checkQueueHealth()
    {
        try {
            // For simplicity, assume queue is healthy if no major issues
            // In real implementation, check failed jobs count, etc.
            $failedJobs = DB::table('failed_jobs')->count();
            return $failedJobs < 10 ? 100 : max(0, 100 - ($failedJobs * 10));
        } catch (\Exception $e) {
            return 50; // Partial health if we can't check
        }
    }

    private function calculateAttendanceRate()
    {
        try {
            $currentMonth = now()->format('Y-m');
            $totalWorkingDays = now()->daysInMonth;
            
            // Calculate average attendance rate across all employees
            $attendanceData = DB::table('attendances')
                ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$currentMonth])
                ->selectRaw('COUNT(*) as total_days, COUNT(DISTINCT employee_id) as unique_employees')
                ->first();
            
            $rate = 0;
            if ($attendanceData && $attendanceData->unique_employees > 0) {
                $expectedDays = $attendanceData->unique_employees * $totalWorkingDays;
                $rate = ($attendanceData->total_days / $expectedDays) * 100;
            }
            
            // Calculate trend (compare with last month)
            $lastMonth = now()->subMonth()->format('Y-m');
            $lastMonthData = DB::table('attendances')
                ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$lastMonth])
                ->selectRaw('COUNT(*) as total_days, COUNT(DISTINCT employee_id) as unique_employees')
                ->first();
            
            $trend = 0;
            if ($lastMonthData && $lastMonthData->unique_employees > 0) {
                $lastRate = ($lastMonthData->total_days / ($lastMonthData->unique_employees * now()->subMonth()->daysInMonth)) * 100;
                $trend = $rate - $lastRate;
            }
            
            return [
                'rate' => round($rate, 1),
                'trend' => round($trend, 1)
            ];
        } catch (\Exception $e) {
            return ['rate' => 0, 'trend' => 0];
        }
    }

    private function getWorkReportsMetrics()
    {
        try {
            $currentMonth = now()->format('Y-m');
            
            // Current month work reports
            $currentData = DB::table('work_reports')
                ->whereRaw("DATE_FORMAT(created_at, '%Y-%m') = ?", [$currentMonth])
                ->selectRaw('COUNT(*) as count, SUM(successful_calls) as successful_calls')
                ->first();
            
            // Last month for trend calculation
            $lastMonth = now()->subMonth()->format('Y-m');
            $lastData = DB::table('work_reports')
                ->whereRaw("DATE_FORMAT(created_at, '%Y-%m') = ?", [$lastMonth])
                ->selectRaw('COUNT(*) as count, SUM(successful_calls) as successful_calls')
                ->first();
            
            $countTrend = 0;
            $callsTrend = 0;
            
            if ($lastData && $lastData->count > 0) {
                $countTrend = (($currentData->count - $lastData->count) / $lastData->count) * 100;
            }
            
            if ($lastData && $lastData->successful_calls > 0) {
                $callsTrend = (($currentData->successful_calls - $lastData->successful_calls) / $lastData->successful_calls) * 100;
            }
            
            return [
                'count' => $currentData->count ?? 0,
                'trend' => round($countTrend, 1),
                'successfulCalls' => $currentData->successful_calls ?? 0,
                'callsTrend' => round($callsTrend, 1)
            ];
        } catch (\Exception $e) {
            return ['count' => 0, 'trend' => 0, 'successfulCalls' => 0, 'callsTrend' => 0];
        }
    }

    private function getPerformanceMetrics()
    {
        try {
            // Calculate average performance based on competency assessments
            $currentMonth = now()->format('Y-m');
            
            $currentScore = DB::table('competency_assessments')
                ->where('status', 'approved')
                ->whereRaw("DATE_FORMAT(updated_at, '%Y-%m') = ?", [$currentMonth])
                ->avg('rating');
            
            $lastMonth = now()->subMonth()->format('Y-m');
            $lastScore = DB::table('competency_assessments')
                ->where('status', 'approved')
                ->whereRaw("DATE_FORMAT(updated_at, '%Y-%m') = ?", [$lastMonth])
                ->avg('rating');
            
            $trend = 0;
            if ($lastScore > 0) {
                $trend = (($currentScore - $lastScore) / $lastScore) * 100;
            }
            
            // Convert rating to percentage (assuming 5-point scale)
            $avgScore = $currentScore ? ($currentScore / 5) * 100 : 0;
            
            return [
                'avgScore' => round($avgScore, 1),
                'trend' => round($trend, 1)
            ];
        } catch (\Exception $e) {
            return ['avgScore' => 0, 'trend' => 0];
        }
    }

    private function getEmployeeJourneyMetrics($employeeId)
    {
        try {
            $employee = Employee::find($employeeId);
            if (!$employee || !$employee->join_date) {
                return $this->getDefaultJourneyMetrics();
            }

            $joinDate = $employee->join_date;
            $now = now();
            
            // Calculate service duration
            $daysWithCompany = $joinDate->diffInDays($now);
            $monthsWithCompany = $joinDate->diffInMonths($now);
            $yearsOfService = $joinDate->diffInYears($now);
            
            // Total work hours
            $totalWorkMinutes = DB::table('attendances')
                ->where('employee_id', $employeeId)
                ->sum('work_minutes');
            $totalWorkHours = round($totalWorkMinutes / 60, 1);
            
            // Projects contributed to (from timesheets)
            $projectsContributed = DB::table('timesheets')
                ->where('employee_id', $employeeId)
                ->distinct('project_id')
                ->count();
            
            // Attendance trend (last 3 months vs previous 3 months)
            $recentAttendance = DB::table('attendances')
                ->where('employee_id', $employeeId)
                ->where('date', '>=', now()->subMonths(3))
                ->count();
            $previousAttendance = DB::table('attendances')
                ->where('employee_id', $employeeId)
                ->whereBetween('date', [now()->subMonths(6), now()->subMonths(3)])
                ->count();
            
            $attendanceTrend = $previousAttendance > 0 ? 
                round((($recentAttendance - $previousAttendance) / $previousAttendance) * 100, 1) : 0;
            
            // Productivity trend (work reports)
            $recentReports = DB::table('work_reports')
                ->where('employee_id', $employeeId)
                ->where('created_at', '>=', now()->subMonths(3))
                ->count();
            $previousReports = DB::table('work_reports')
                ->where('employee_id', $employeeId)
                ->whereBetween('created_at', [now()->subMonths(6), now()->subMonths(3)])
                ->count();
            
            $productivityTrend = $previousReports > 0 ? 
                round((($recentReports - $previousReports) / $previousReports) * 100, 1) : 0;

            return [
                'daysWithCompany' => $daysWithCompany,
                'monthsWithCompany' => $monthsWithCompany,
                'yearsOfService' => $yearsOfService,
                'totalWorkHours' => $totalWorkHours,
                'projectsContributed' => $projectsContributed,
                'attendanceTrend' => $attendanceTrend,
                'productivityTrend' => $productivityTrend,
            ];
        } catch (\Exception $e) {
            return $this->getDefaultJourneyMetrics();
        }
    }

    private function getEmployeeGrowthMetrics($employeeId)
    {
        try {
            // Skills growth (from assessments)
            $totalAssessments = DB::table('competency_assessments')
                ->where('employee_id', $employeeId)
                ->where('status', 'submitted')
                ->count();
            
            $recentAssessments = DB::table('competency_assessments')
                ->where('employee_id', $employeeId)
                ->where('status', 'submitted')
                ->where('updated_at', '>=', now()->subMonths(6))
                ->count();
            
            $skillsGrowth = $totalAssessments > 0 ? round(($recentAssessments / $totalAssessments) * 100, 1) : 0;
            
            // Competency progress (average rating improvement)
            $firstHalfAvg = DB::table('competency_assessments')
                ->where('employee_id', $employeeId)
                ->where('status', 'submitted')
                ->where('updated_at', '<', now()->subMonths(6))
                ->avg('rating');
            
            $recentAvg = DB::table('competency_assessments')
                ->where('employee_id', $employeeId)
                ->where('status', 'submitted')
                ->where('updated_at', '>=', now()->subMonths(6))
                ->avg('rating');
            
            // If we have both periods, calculate improvement
            if ($firstHalfAvg && $recentAvg) {
                $competencyProgress = round((($recentAvg - $firstHalfAvg) / $firstHalfAvg) * 100, 1);
            } else {
                // If we only have recent assessments, show progress based on completion rate
                $totalPossibleAssessments = DB::table('competency_assessments')
                    ->where('employee_id', $employeeId)
                    ->count();
                
                $completedAssessments = DB::table('competency_assessments')
                    ->where('employee_id', $employeeId)
                    ->where('status', 'submitted')
                    ->count();
                
                $competencyProgress = $totalPossibleAssessments > 0 ? 
                    round(($completedAssessments / $totalPossibleAssessments) * 100, 1) : 0;
            }
            
            // Performance trend
            $performanceTrend = $competencyProgress;

            return [
                'skillsGrowth' => $skillsGrowth,
                'competencyProgress' => $competencyProgress,
                'performanceTrend' => $performanceTrend,
            ];
        } catch (\Exception $e) {
            return ['skillsGrowth' => 0, 'competencyProgress' => 0, 'performanceTrend' => 0];
        }
    }

    private function getEmployeeAchievements($employeeId)
    {
        try {
            // Calculate achievements based on various metrics
            $achievements = [];
            
            // Perfect attendance months
            $perfectAttendanceMonths = $this->calculatePerfectAttendanceMonths($employeeId);
            if ($perfectAttendanceMonths > 0) {
                $achievements[] = "Perfect Attendance ({$perfectAttendanceMonths} months)";
            }
            
            // High performance ratings
            $excellentRatings = DB::table('competency_assessments')
                ->where('employee_id', $employeeId)
                ->where('status', 'submitted')
                ->where('rating', '>=', 4.5)
                ->count();
            
            if ($excellentRatings > 0) {
                $achievements[] = "Excellence in Performance ({$excellentRatings} assessments)";
            }
            
            // Consistent work reporting
            $consistentMonths = $this->calculateConsistentReportingMonths($employeeId);
            if ($consistentMonths > 0) {
                $achievements[] = "Consistent Reporting ({$consistentMonths} months)";
            }
            
            // Performance rank among peers
            $performanceRank = $this->calculatePerformanceRank($employeeId);
            
            // Consistency score
            $consistencyScore = $this->calculateConsistencyScore($employeeId);
            
            return [
                'totalAchievements' => count($achievements),
                'recentAchievements' => array_slice($achievements, 0, 3),
                'performanceRank' => $performanceRank,
                'consistencyScore' => $consistencyScore,
            ];
        } catch (\Exception $e) {
            return [
                'totalAchievements' => 0,
                'recentAchievements' => [],
                'performanceRank' => 'N/A',
                'consistencyScore' => 0,
            ];
        }
    }

    private function calculateLeaveBalance($employeeId)
    {
        try {
            // Assuming 25 days annual leave allowance
            $annualAllowance = 25;
            $usedLeaves = DB::table('leaves')
                ->where('employee_id', $employeeId)
                ->where('status', 'approved')
                ->whereYear('start_date', now()->year)
                ->sum(DB::raw('DATEDIFF(end_date, start_date) + 1'));
            
            return max(0, $annualAllowance - $usedLeaves);
        } catch (\Exception $e) {
            return 25;
        }
    }

    private function calculatePerfectAttendanceMonths($employeeId)
    {
        try {
            $months = 0;
            for ($i = 0; $i < 12; $i++) {
                $month = now()->subMonths($i);
                $workingDays = $month->daysInMonth - ($month->weekendsInMonth * 2);
                $attendedDays = DB::table('attendances')
                    ->where('employee_id', $employeeId)
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->count();
                
                if ($attendedDays >= $workingDays * 0.95) { // 95% threshold
                    $months++;
                }
            }
            return $months;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function calculateConsistentReportingMonths($employeeId)
    {
        try {
            $months = 0;
            for ($i = 0; $i < 6; $i++) {
                $month = now()->subMonths($i);
                $reports = DB::table('work_reports')
                    ->where('employee_id', $employeeId)
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count();
                
                if ($reports >= 15) { // At least 15 reports per month
                    $months++;
                }
            }
            return $months;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function calculatePerformanceRank($employeeId)
    {
        try {
            // Get employee's average rating from submitted assessments
            $employeeAvg = DB::table('competency_assessments')
                ->where('employee_id', $employeeId)
                ->where('status', 'submitted')
                ->whereNotNull('rating')
                ->avg('rating');
            
            if (!$employeeAvg) return 'N/A';
            
            // Count employees with better average ratings
            $betterPerformers = DB::table('competency_assessments')
                ->select('employee_id')
                ->where('status', 'submitted')
                ->whereNotNull('rating')
                ->groupBy('employee_id')
                ->havingRaw('AVG(rating) > ?', [$employeeAvg])
                ->count();
            
            // Count total employees with ratings
            $totalEmployees = DB::table('competency_assessments')
                ->where('status', 'submitted')
                ->whereNotNull('rating')
                ->distinct('employee_id')
                ->count('employee_id');
            
            if ($totalEmployees <= 1) {
                return 'N/A'; // Need at least 2 employees for meaningful ranking
            }
            
            $rank = $betterPerformers + 1;
            $percentile = round((($totalEmployees - $rank + 1) / $totalEmployees) * 100);
            
            // Format the rank nicely
            if ($percentile >= 90) {
                return "Top 10%";
            } elseif ($percentile >= 75) {
                return "Top 25%";
            } elseif ($percentile >= 50) {
                return "Top 50%";
            } else {
                return "#{$rank} of {$totalEmployees}";
            }
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function calculateConsistencyScore($employeeId)
    {
        try {
            // Combine attendance, reporting, and performance consistency
            $attendanceConsistency = $this->getAttendanceConsistency($employeeId);
            $reportingConsistency = $this->getReportingConsistency($employeeId);
            $performanceConsistency = $this->getPerformanceConsistency($employeeId);
            
            return round(($attendanceConsistency + $reportingConsistency + $performanceConsistency) / 3, 1);
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getAttendanceConsistency($employeeId)
    {
        // Calculate standard deviation of monthly attendance rates
        $monthlyRates = [];
        for ($i = 0; $i < 6; $i++) {
            $month = now()->subMonths($i);
            $workingDays = $month->daysInMonth - ($month->weekendsInMonth * 2);
            $attendedDays = DB::table('attendances')
                ->where('employee_id', $employeeId)
                ->whereYear('date', $month->year)
                ->whereMonth('date', $month->month)
                ->count();
            
            $monthlyRates[] = $workingDays > 0 ? ($attendedDays / $workingDays) * 100 : 0;
        }
        
        if (empty($monthlyRates)) return 0;
        
        $mean = array_sum($monthlyRates) / count($monthlyRates);
        $variance = array_sum(array_map(function($x) use ($mean) { return pow($x - $mean, 2); }, $monthlyRates)) / count($monthlyRates);
        $stdDev = sqrt($variance);
        
        // Convert to consistency score (lower std dev = higher consistency)
        return max(0, 100 - $stdDev);
    }

    private function getReportingConsistency($employeeId)
    {
        // Similar calculation for work reports
        $monthlyReports = [];
        for ($i = 0; $i < 6; $i++) {
            $month = now()->subMonths($i);
            $reports = DB::table('work_reports')
                ->where('employee_id', $employeeId)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            
            $monthlyReports[] = $reports;
        }
        
        if (empty($monthlyReports)) return 0;
        
        $mean = array_sum($monthlyReports) / count($monthlyReports);
        $variance = array_sum(array_map(function($x) use ($mean) { return pow($x - $mean, 2); }, $monthlyReports)) / count($monthlyReports);
        $stdDev = sqrt($variance);
        
        return max(0, 100 - ($stdDev * 5)); // Scale factor for reports
    }

    private function getPerformanceConsistency($employeeId)
    {
        // Calculate consistency in assessment ratings
        $ratings = DB::table('competency_assessments')
            ->where('employee_id', $employeeId)
            ->where('status', 'submitted')
            ->whereNotNull('rating')
            ->where('updated_at', '>=', now()->subYear())
            ->pluck('rating')
            ->toArray();
        
        if (count($ratings) < 2) return 0;
        
        $mean = array_sum($ratings) / count($ratings);
        $variance = array_sum(array_map(function($x) use ($mean) { return pow($x - $mean, 2); }, $ratings)) / count($ratings);
        $stdDev = sqrt($variance);
        
        return max(0, 100 - ($stdDev * 20)); // Scale factor for ratings
    }

    private function getDefaultJourneyMetrics()
    {
        return [
            'daysWithCompany' => 0,
            'monthsWithCompany' => 0,
            'yearsOfService' => 0,
            'totalWorkHours' => 0,
            'projectsContributed' => 0,
            'attendanceTrend' => 0,
            'productivityTrend' => 0,
        ];
    }



    private function calculateEmployeeAttendanceRate($employeeId)
    {
        try {
            $currentMonth = now()->format('Y-m');
            
            // Calculate working days in current month (excluding weekends)
            $startOfMonth = now()->startOfMonth();
            $endOfMonth = now()->endOfMonth();
            $workingDays = 0;
            
            for ($date = $startOfMonth->copy(); $date->lte($endOfMonth); $date->addDay()) {
                if (!$date->isWeekend()) {
                    $workingDays++;
                }
            }
            
            $attendedDays = DB::table('attendances')
                ->where('employee_id', $employeeId)
                ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$currentMonth])
                ->count();
            
            if ($workingDays <= 0) {
                return 0;
            }
            
            return round(($attendedDays / $workingDays) * 100, 1);
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getSystemActivities()
    {
        $activities = collect();

        // Recent User Registrations
        $recentUsers = User::with('employee')
            ->where('created_at', '>=', now()->subDays(7))
            ->latest()
            ->take(3)
            ->get();

        foreach ($recentUsers as $user) {
            $activities->push([
                'id' => 'user_' . $user->id,
                'type' => 'create',
                'status' => 'success',
                'title' => 'New user registered',
                'description' => $user->name . ' joined the system',
                'timestamp' => $user->created_at->toISOString(),
                'user' => ['name' => 'System', 'avatar' => null]
            ]);
        }

        // Recent Leave Approvals/Rejections
        $recentLeaves = Leave::with('employee.user')
            ->whereIn('status', ['approved', 'rejected'])
            ->where('updated_at', '>=', now()->subDays(7))
            ->latest('updated_at')
            ->take(5)
            ->get();

        foreach ($recentLeaves as $leave) {
            $activities->push([
                'id' => 'leave_' . $leave->id,
                'type' => $leave->status === 'approved' ? 'approve' : 'reject',
                'status' => $leave->status === 'approved' ? 'success' : 'error',
                'title' => 'Leave request ' . $leave->status,
                'description' => ucfirst($leave->leave_type) . ' leave ' . $leave->status . ' for ' . $leave->employee->user->name,
                'timestamp' => $leave->updated_at->toISOString(),
                'user' => ['name' => 'HR Manager', 'avatar' => null]
            ]);
        }

        // Recent Department Updates
        $recentDepartments = Department::with('manager.user')
            ->where('updated_at', '>=', now()->subDays(7))
            ->where('updated_at', '!=', DB::raw('created_at'))
            ->latest('updated_at')
            ->take(3)
            ->get();

        foreach ($recentDepartments as $department) {
            $activities->push([
                'id' => 'dept_' . $department->id,
                'type' => 'update',
                'status' => 'info',
                'title' => 'Department updated',
                'description' => $department->name . ' department information modified',
                'timestamp' => $department->updated_at->toISOString(),
                'user' => ['name' => 'Admin', 'avatar' => null]
            ]);
        }

        // Recent Employee Additions
        $recentEmployees = Employee::with('user', 'department')
            ->where('created_at', '>=', now()->subDays(7))
            ->latest()
            ->take(3)
            ->get();

        foreach ($recentEmployees as $employee) {
            $activities->push([
                'id' => 'emp_' . $employee->id,
                'type' => 'create',
                'status' => 'success',
                'title' => 'New employee added',
                'description' => $employee->user->name . ' joined ' . ($employee->department->name ?? 'the company'),
                'timestamp' => $employee->created_at->toISOString(),
                'user' => ['name' => 'HR', 'avatar' => null]
            ]);
        }

        // Recent Timesheet Approvals
        $recentTimesheets = Timesheet::with('employee.user')
            ->whereIn('status', ['approved', 'rejected'])
            ->where('updated_at', '>=', now()->subDays(7))
            ->latest('updated_at')
            ->take(3)
            ->get();

        foreach ($recentTimesheets as $timesheet) {
            $dateRange = '';
            if ($timesheet->start_date && $timesheet->end_date) {
                $dateRange = ' (' . $timesheet->start_date->format('M d') . ' - ' . $timesheet->end_date->format('M d') . ')';
            } elseif ($timesheet->start_date) {
                $dateRange = ' (' . $timesheet->start_date->format('M d') . ')';
            }

            $activities->push([
                'id' => 'timesheet_' . $timesheet->id,
                'type' => $timesheet->status === 'approved' ? 'approve' : 'reject',
                'status' => $timesheet->status === 'approved' ? 'success' : 'error',
                'title' => 'Timesheet ' . $timesheet->status,
                'description' => 'Timesheet for ' . $timesheet->employee->user->name . $dateRange,
                'timestamp' => $timesheet->updated_at->toISOString(),
                'user' => ['name' => 'Manager', 'avatar' => null]
            ]);
        }

        // Recent Competency Assessment Activities
        $recentAssessments = CompetencyAssessment::with(['employee.user', 'competency'])
            ->whereIn('status', ['approved', 'rejected', 'submitted'])
            ->where('updated_at', '>=', now()->subDays(7))
            ->latest('updated_at')
            ->take(5)
            ->get();

        foreach ($recentAssessments as $assessment) {
            $statusText = $assessment->status === 'submitted' ? 'submitted' : $assessment->status;
            $activities->push([
                'id' => 'assessment_' . $assessment->id,
                'type' => $assessment->status === 'approved' ? 'approve' : ($assessment->status === 'rejected' ? 'reject' : 'create'),
                'status' => $assessment->status === 'approved' ? 'success' : ($assessment->status === 'rejected' ? 'error' : 'info'),
                'title' => 'Assessment ' . $statusText,
                'description' => ($assessment->competency->name ?? 'Competency') . ' assessment for ' . $assessment->employee->user->name,
                'timestamp' => $assessment->updated_at->toISOString(),
                'user' => ['name' => ucfirst($assessment->assessment_type) . ' Assessor', 'avatar' => null]
            ]);
        }

        // Sort all activities by timestamp (most recent first) and take top 10
        return $activities
            ->sortByDesc('timestamp')
            ->take(10)
            ->values()
            ->toArray();
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

        $assessments = CompetencyAssessment::where('status', 'submitted')
            ->with(['employee.user', 'competency'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'type' => 'competency-assessment',
                    'title' => 'Competency Assessment',
                    'description' => ($assessment->competency->name ?? 'Assessment') . ' - ' . ucfirst($assessment->assessment_type) . ' assessment',
                    'requester' => $assessment->employee->user->name ?? 'Unknown',
                    'created_at' => $assessment->created_at,
                ];
            });

        return $leaves->concat($timesheets)->concat($assessments)->sortByDesc('created_at')->take(10)->values()->all();
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

    public function approveItem(Request $request, $id)
    {
        try {
            // Determine the type of approval based on the request or item
            $type = $request->input('type');
            
            if (!$type) {
                // Try to determine type from the item itself
                if (Leave::find($id)) {
                    $type = 'leave';
                } elseif (Timesheet::find($id)) {
                    $type = 'timesheet';
                } elseif (CompetencyAssessment::find($id)) {
                    $type = 'competency-assessment';
                }
            }
            
            switch ($type) {
                case 'leave':
                    $leave = Leave::findOrFail($id);
                    $leave->update(['status' => 'approved']);
                    return response()->json(['success' => true, 'message' => 'Leave request approved successfully']);
                    
                case 'timesheet':
                    $timesheet = Timesheet::findOrFail($id);
                    $timesheet->update(['status' => 'approved']);
                    return response()->json(['success' => true, 'message' => 'Timesheet approved successfully']);
                    
                case 'competency-assessment':
                    $assessment = CompetencyAssessment::findOrFail($id);
                    $assessment->update(['status' => 'approved']);
                    return response()->json(['success' => true, 'message' => 'Assessment approved successfully']);
                    
                default:
                    return response()->json(['success' => false, 'message' => 'Unknown approval type'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Approval failed: ' . $e->getMessage()], 500);
        }
    }
    
    public function rejectItem(Request $request, $id)
    {
        try {
            $reason = $request->input('reason', 'No reason provided');
            $type = $request->input('type');
            
            if (!$type) {
                // Try to determine type from the item itself
                if (Leave::find($id)) {
                    $type = 'leave';
                } elseif (Timesheet::find($id)) {
                    $type = 'timesheet';
                } elseif (CompetencyAssessment::find($id)) {
                    $type = 'competency-assessment';
                }
            }
            
            switch ($type) {
                case 'leave':
                    $leave = Leave::findOrFail($id);
                    $leave->update([
                        'status' => 'rejected',
                        'rejection_reason' => $reason
                    ]);
                    return response()->json(['success' => true, 'message' => 'Leave request rejected']);
                    
                case 'timesheet':
                    $timesheet = Timesheet::findOrFail($id);
                    $timesheet->update([
                        'status' => 'rejected',
                        'rejection_reason' => $reason
                    ]);
                    return response()->json(['success' => true, 'message' => 'Timesheet rejected']);
                    
                case 'competency-assessment':
                    $assessment = CompetencyAssessment::findOrFail($id);
                    $assessment->update([
                        'status' => 'rejected',
                        'rejection_reason' => $reason
                    ]);
                    return response()->json(['success' => true, 'message' => 'Assessment rejected']);
                    
                default:
                    return response()->json(['success' => false, 'message' => 'Unknown approval type'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Rejection failed: ' . $e->getMessage()], 500);
        }
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

        $clockedIn = $attendance->isClockedIn();

        $result = [
            'clocked_in' => $clockedIn,
            'on_break' => $attendance->on_break,
            'clock_in_time' => $attendance->clock_in?->toISOString(),
            'current_break_start' => $attendance->current_break_start?->setTimezone('Asia/Kolkata')->toISOString(),
            'break_sessions' => $attendance->break_sessions ?? [],
            'current_session' => $attendance,
            'todays_summary' => $this->getTodaysSummary($employeeId),
            'recent_activities' => $this->getRecentActivities($employeeId),
            'stats' => $this->getAttendanceStats($employeeId)
        ];

        // Log for debugging
        \Log::info('DashboardController getCurrentAttendanceStatus', [
            'employee_id' => $employeeId,
            'attendance_id' => $attendance->id,
            'break_sessions' => $attendance->break_sessions,
            'break_sessions_count' => count($attendance->break_sessions ?? []),
            'result_break_sessions' => $result['break_sessions']
        ]);

        return $result;
    }

    private function getBreakViolations()
    {
        try {
            $violations = [];
            


            // Get attendances with active breaks (including old ones that haven't been ended)
            $attendances = Attendance::where('on_break', true)
                ->whereNotNull('current_break_start')
                ->where('current_break_start', '>=', now()->subDays(7)) // Check breaks from last 7 days
                ->with(['employee.user', 'employee.department'])
                ->get();



            foreach ($attendances as $attendance) {
                if (!$attendance->employee || !$attendance->employee->user) continue;
                
                $breakSessions = $attendance->break_sessions ?? [];
                $currentBreakStart = $attendance->current_break_start;
                
                if ($currentBreakStart) {
                    $currentBreakDuration = $currentBreakStart->diffInMinutes(now());
                    $breakNumber = count($breakSessions) + 1;
                    
                    // Define break limits
                    $limits = [1 => 15, 2 => 30, 3 => 15]; // minutes
                    $limit = $limits[$breakNumber] ?? 15;
                    

                    
                    if ($currentBreakDuration > $limit) {
                        $violation = [
                            'employee_id' => $attendance->employee_id,
                            'employee_name' => $attendance->employee->user->name,
                            'job_title' => $attendance->employee->job_title,
                            'department' => $attendance->employee->department->name ?? 'General',
                            'break_number' => $breakNumber,
                            'duration' => $this->formatDuration($currentBreakDuration),
                            'limit' => $this->formatDuration($limit),
                            'overtime' => $this->formatDuration($currentBreakDuration - $limit),
                            'break_start' => $currentBreakStart->format('H:i'),
                        ];
                        $violations[] = $violation;
                        Log::info('Break violation detected', $violation);
                    }
                }
            }
            

            return $violations;
        } catch (\Exception $e) {
            Log::error('Error getting break violations: ' . $e->getMessage());
            return [];
        }
    }

    private function formatDuration($minutes)
    {
        if ($minutes < 60) {
            return $minutes . 'm';
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        return $hours . 'h ' . $remainingMinutes . 'm';
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
        $currentMonth = now()->format('Y-m');
        
        $monthlyAttendance = Attendance::where('employee_id', $employeeId)
            ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$currentMonth])
            ->count();

        $workingDaysThisMonth = now()->daysInMonth - (now()->weekendsInMonth * 2);
        $attendanceRate = $workingDaysThisMonth > 0 ? round(($monthlyAttendance / $workingDaysThisMonth) * 100, 1) : 0;

        return [
            'monthly_attendance' => $monthlyAttendance,
            'working_days' => $workingDaysThisMonth,
            'attendance_rate' => $attendanceRate,
            'perfect_days' => $monthlyAttendance // Simplified - could be more complex
        ];
    }
}
