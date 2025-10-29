<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TimesheetController;
use App\Http\Controllers\WorkReportController;
use App\Http\Controllers\Admin\CompetencyController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\EmployeeCompetencyController;
use App\Http\Controllers\CompetencyAssessmentController;
use App\Http\Controllers\CompetencyDevelopmentPlanController;
use App\Http\Controllers\AssessmentCycleController;
use App\Http\Controllers\AssessmentWorkflowController;
use App\Http\Controllers\CompetencyAnalyticsController;
use App\Http\Controllers\OrganizationalAnalyticsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
Route::get('/dashboard-test', [App\Http\Controllers\DashboardTestController::class, 'test'])->middleware(['auth', 'verified'])->name('dashboard.test');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/employee', [ProfileController::class, 'updateEmployee'])->name('profile.update-employee');

    // Form Layout Demo
    Route::get('/form-layout-demo', function () {
        return Inertia::render('FormLayoutDemo');
    })->name('form.layout.demo');
    
    // Animation Demo
    Route::get('/animation-demo', function () {
        return Inertia::render('AnimationDemo');
    })->name('animation.demo');
    Route::get('my-profile', [EmployeeController::class, 'myProfile'])->name('employees.my-profile');
    
    // Employee Management Routes - Restricted to Admin, HR, and Manager roles
    Route::middleware(['role:Admin|HR|Manager'])->group(function () {
        Route::resource('employees', EmployeeController::class)->except(['show']);
        Route::get('employees-trash', [EmployeeController::class, 'trash'])->name('employees.trash');
        Route::post('employees/{employee}/reset-password', [EmployeeController::class, 'resetPassword'])->name('employees.reset-password');
        Route::post('employees/{employee}/mark-as-exit', [EmployeeController::class, 'markAsExit'])->name('employees.mark-as-exit');
        Route::post('employees/{employee}/reactivate', [EmployeeController::class, 'reactivate'])->name('employees.reactivate');
        Route::post('employees/{id}/restore', [EmployeeController::class, 'restore'])->name('employees.restore');
        Route::delete('employees/{id}/force-delete', [EmployeeController::class, 'forceDelete'])->name('employees.force-delete');
        
        // Employee Import Routes
        Route::get('employees-import', [\App\Http\Controllers\EmployeeImportController::class, 'index'])->name('employees.import');
        Route::post('employees-import', [\App\Http\Controllers\EmployeeImportController::class, 'store'])->name('employees.import.store');
        Route::post('employees-import-preview', [\App\Http\Controllers\EmployeeImportController::class, 'preview'])->name('employees.import.preview');
        Route::get('employees-template', [\App\Http\Controllers\EmployeeImportController::class, 'template'])->name('employees.template');
    });
    
    // Employee Show Route - Uses policy-based authorization (allows viewing colleagues in same department)
    Route::get('employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    Route::resource('departments', DepartmentController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('tasks', TaskController::class);
    Route::resource('timesheets', TimesheetController::class);
    Route::post('timesheets/{timesheet}/approve', [TimesheetController::class, 'approve'])->name('timesheets.approve');
    Route::post('timesheets/{timesheet}/reject', [TimesheetController::class, 'reject'])->name('timesheets.reject');
    Route::post('timesheets/bulk-approve', [TimesheetController::class, 'bulkApprove'])->name('timesheets.bulk-approve');
    Route::get('timesheets/pending/approvals', [TimesheetController::class, 'pendingApprovals'])->name('timesheets.pending-approvals');
    Route::get('api/timesheets/approval-stats', [TimesheetController::class, 'approvalStats'])->name('timesheets.approval-stats');
    Route::post('timesheets/{timesheet}/sync-attendance', [TimesheetController::class, 'syncWithAttendance'])->name('timesheets.sync-attendance');
    Route::get('timesheets/{timesheet}/attendance-data', [TimesheetController::class, 'getAttendanceData'])->name('timesheets.attendance-data');
    Route::get('work-reports/leaderboard', [WorkReportController::class, 'leaderboard'])->name('work-reports.leaderboard');
    Route::resource('work-reports', WorkReportController::class);
    Route::resource('attendances', AttendanceController::class);
    Route::post('attendances/clock-in', [AttendanceController::class, 'clockIn'])->name('attendances.clockIn');
    Route::post('attendances/clock-out', [AttendanceController::class, 'clockOut'])->name('attendances.clockOut');
    Route::get('attendances/{attendance}/export', [AttendanceController::class, 'export'])->name('attendances.export');
    Route::post('attendances/bulk-export', [AttendanceController::class, 'bulkExport'])->name('attendances.bulkExport');
    Route::post('attendances/manual-clock-out', [AttendanceController::class, 'manualClockOut'])->name('attendances.manual-clock-out');
    
    Route::get('api/csrf-token', function () {
        return response()->json(['csrf_token' => csrf_token()]);
    });

    // Real-time attendance API routes
    Route::prefix('api/attendance')->group(function () {
        Route::post('clock-in', [AttendanceController::class, 'clockIn']);
        Route::post('clock-out', [AttendanceController::class, 'clockOut']);
        Route::post('break-start', [AttendanceController::class, 'startBreak']);
        Route::post('break-end', [AttendanceController::class, 'endBreak']);
        Route::get('current', [AttendanceController::class, 'getCurrentStatus']);
    });

    // Birthday API routes (for future use)
    Route::prefix('api/birthday')->group(function () {
        Route::get('status', [App\Http\Controllers\BirthdayController::class, 'getCurrentUserBirthdayStatus']);
        Route::get('stats', [App\Http\Controllers\BirthdayController::class, 'getBirthdayStats']);
    });
    Route::resource('leaves', LeaveController::class)->parameters(['leaves' => 'leave']);
    Route::post('leaves/{leave}/approve', [LeaveController::class, 'approve'])->name('leaves.approve');
    Route::post('leaves/{leave}/reject', [LeaveController::class, 'reject'])->name('leaves.reject');
    Route::put('leaves/{leave}/update-and-approve', [LeaveController::class, 'updateAndApprove'])->name('leaves.update-and-approve');
    
    // Leave Types (Leave Policies) Management
    Route::resource('leave-types', LeaveTypeController::class)->parameters(['leave-types' => 'leaveType']);
    Route::post('leave-types/{leaveType}/toggle-status', [LeaveTypeController::class, 'toggleStatus'])->name('leave-types.toggle-status');
    
    // Debug route to test data passing
    Route::get('debug/leave-data/{leave}', function(App\Models\Leave $leave) {
        $leave->load(['employee.user', 'leaveType']);
        
        return response()->json([
            'raw_leave' => $leave->toArray(),
            'inertia_data' => [
                'leave' => $leave
            ],
            'relationships_loaded' => [
                'employee' => $leave->relationLoaded('employee'),
                'leaveType' => $leave->relationLoaded('leaveType'),
                'user' => $leave->employee ? $leave->employee->relationLoaded('user') : false
            ]
        ]);
    })->name('debug.leave.data');
    Route::resource('feedbacks', FeedbackController::class);

    Route::get('/reports/attendance/pdf', [ReportController::class, 'attendancePdf'])->name('reports.attendance.pdf');
    Route::get('/reports/attendance/excel', [ReportController::class, 'attendanceExcel'])->name('reports.attendance.excel');
    Route::get('/reports/leaves/pdf', [ReportController::class, 'leavesPdf'])->name('reports.leaves.pdf');
    Route::get('/reports/leaves/excel', [ReportController::class, 'leavesExcel'])->name('reports.leaves.excel');
    Route::get('/reports/timesheets/pdf', [ReportController::class, 'timesheetsPdf'])->name('reports.timesheets.pdf');
    Route::get('/reports/timesheets/excel', [ReportController::class, 'timesheetsExcel'])->name('reports.timesheets.excel');
    Route::get('/reports/feedbacks/pdf', [ReportController::class, 'feedbacksPdf'])->name('reports.feedbacks.pdf');
    Route::get('/reports/feedbacks/excel', [ReportController::class, 'feedbacksExcel'])->name('reports.feedbacks.excel');
    
    // Reports Dashboard Routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/stats', [ReportController::class, 'stats'])->name('reports.stats');
    Route::post('/reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
    Route::post('/reports/schedule', [ReportController::class, 'schedule'])->name('reports.schedule');
    Route::post('/reports/custom', [ReportController::class, 'custom'])->name('reports.custom');
    Route::get('/reports/recent', [ReportController::class, 'recent'])->name('reports.recent');
    Route::get('/reports/{id}/download', [ReportController::class, 'download'])->name('reports.download');
    Route::delete('/reports/{id}', [ReportController::class, 'destroy'])->name('reports.destroy');
    
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    Route::resource('competencies', CompetencyController::class);
    Route::post('competencies/{competency}/toggle-status', [CompetencyController::class, 'toggleStatus'])->name('competencies.toggle-status');
    Route::post('competencies/bulk-activate', [CompetencyController::class, 'bulkActivate'])->name('competencies.bulk-activate');
    Route::post('competencies/bulk-deactivate', [CompetencyController::class, 'bulkDeactivate'])->name('competencies.bulk-deactivate');
    Route::post('competencies/bulk-delete', [CompetencyController::class, 'bulkDelete'])->name('competencies.bulk-delete');
    Route::post('competencies/{competency}/duplicate', [CompetencyController::class, 'duplicate'])->name('competencies.duplicate');
    Route::get('competencies/export', [CompetencyController::class, 'export'])->name('competencies.export');
    
    // Competency Assessment routes
    Route::get('assessment-dashboard', [CompetencyAssessmentController::class, 'dashboard'])->name('assessment-dashboard');
    Route::get('assessment-form', [CompetencyAssessmentController::class, 'createForm'])->name('assessment-form');
    Route::get('my-self-assessment', [CompetencyAssessmentController::class, 'createSelfAssessment'])->name('my-self-assessment');
    
    // File routes for assessment evidence
    Route::post('assessment-files/{assessmentId}/upload', [App\Http\Controllers\AssessmentFileController::class, 'upload'])
        ->name('assessment-files.upload');
    Route::get('assessment-files/{assessmentId}/{fileName}', [App\Http\Controllers\AssessmentFileController::class, 'show'])
        ->name('assessment-files.show');
    Route::get('assessment-form/{competencyAssessment}/edit', [CompetencyAssessmentController::class, 'editForm'])->name('assessment-form.edit');
    
    // Test route for debugging
    // Test assessment authorization
    Route::get('test-assessment-auth', function() {
        $user = Auth::user();
        $assessments = \App\Models\CompetencyAssessment::with(['employee.user', 'assessor'])
            ->limit(5)
            ->get()
            ->map(function($assessment) use ($user) {
                $controller = new \App\Http\Controllers\CompetencyAssessmentController(
                    new \App\Services\CompetencyAssessmentService()
                );
                
                return [
                    'id' => $assessment->id,
                    'type' => $assessment->assessment_type,
                    'employee' => $assessment->employee->user->name ?? 'Unknown',
                    'assessor' => $assessment->assessor->name ?? 'Unknown',
                    'status' => $assessment->status,
                    'current_user' => $user->name,
                    'can_edit' => $controller->canEditAssessment($assessment),
                    'can_view' => $controller->canViewAssessment($assessment),
                ];
            });
            
        return response()->json([
            'current_user' => $user->name,
            'user_roles' => $user->roles->pluck('name'),
            'assessments' => $assessments
        ]);
    })->name('test-assessment-auth');

    // Test timesheet date formatting
    Route::get('test-timesheet-date', function() {
        $timesheet = \App\Models\Timesheet::first();
        if (!$timesheet) {
            return response()->json(['error' => 'No timesheet found']);
        }
        
        return response()->json([
            'timesheet_id' => $timesheet->id,
            'raw_date' => $timesheet->getRawOriginal('date'),
            'formatted_date' => $timesheet->date,
            'date_for_input' => $timesheet->date->format('Y-m-d'),
            'iso_string' => $timesheet->date->toISOString(),
            'json_format' => $timesheet->date->toJSON()
        ]);
    })->name('test-timesheet-date');

    // Test timesheet admin functionality
    Route::get('test-timesheet-admin', function() {
        $user = Auth::user();
        $employees = \App\Models\Employee::with('user')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->user->name ?? 'No User',
                'can_create_for' => $user->hasRole('Admin') || $user->hasRole('Manager')
            ];
        });
        
        return response()->json([
            'current_user' => $user->name,
            'user_roles' => $user->roles->pluck('name'),
            'can_select_employee' => $user->hasRole('Admin') || $user->hasRole('Manager'),
            'available_employees' => $employees,
            'total_employees' => $employees->count()
        ]);
    })->name('test-timesheet-admin');

    // Test projects setup
    Route::get('test-projects', function() {
        $projects = \App\Models\Project::select('name', 'is_default', 'client', 'priority', 'status')->get();
        return response()->json([
            'projects' => $projects,
            'default_project' => \App\Models\Project::where('is_default', true)->first(),
            'total_projects' => $projects->count()
        ]);
    })->name('test-projects');

    // Test analytics service
    Route::get('test-analytics', function() {
        try {
            $service = new \App\Services\CompetencyAnalyticsService();
            $skillGaps = $service->generateSkillGapAnalysis();
            $distribution = $service->getCompetencyDistribution();
            
            return response()->json([
                'success' => true,
                'skill_gaps' => $skillGaps,
                'distribution' => $distribution,
                'message' => 'Analytics service is working correctly'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    })->name('test-analytics');

    Route::get('test-assessment-creation', function() {
        $employee = \App\Models\Employee::first();
        $competency = \App\Models\Competency::first();
        
        if (!$employee || !$competency) {
            return response()->json(['error' => 'No test data available']);
        }
        
        try {
            $assessment = \App\Models\CompetencyAssessment::create([
                'employee_id' => $employee->id,
                'competency_id' => $competency->id,
                'assessor_id' => auth()->id(),
                'assessment_cycle_id' => null,
                'assessment_type' => 'manager',
                'status' => 'draft',
                'rating' => null,
                'comments' => null,
                'evidence_files' => [],
                'development_notes' => null,
            ]);
            
            return response()->json([
                'success' => true,
                'assessment_id' => $assessment->id,
                'message' => 'Test assessment created successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    })->name('test-assessment-creation');
    
    Route::resource('competency-assessments', CompetencyAssessmentController::class);
    Route::post('competency-assessments/{competencyAssessment}/submit', [CompetencyAssessmentController::class, 'submit'])->name('competency-assessments.submit');
    Route::post('competency-assessments/{competencyAssessment}/approve', [CompetencyAssessmentController::class, 'approve'])->name('competency-assessments.approve');
    Route::post('competency-assessments/{competencyAssessment}/reject', [CompetencyAssessmentController::class, 'reject'])->name('competency-assessments.reject');
    Route::get('competency-assessments/{competencyAssessment}/evaluate', [CompetencyAssessmentController::class, 'evaluate'])->name('competency-assessments.evaluate');
    Route::get('employees/{employee}/assessments', [CompetencyAssessmentController::class, 'byEmployee'])->name('competency-assessments.by-employee');
    Route::get('my-assessments', [CompetencyAssessmentController::class, 'myAssessments'])->name('competency-assessments.my-assessments');
    
    // Debug route for my assessments
    Route::get('debug-my-assessments-page', function(\Illuminate\Http\Request $request) {
        $user = Auth::user();
        $employee = \App\Models\Employee::where('user_id', $user->id)->first();
        
        $query = \App\Models\CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle'])
            ->where(function ($q) use ($user, $employee) {
                $q->where('assessor_id', $user->id);
                if ($employee) {
                    $q->orWhere(function ($subQ) use ($employee) {
                        $subQ->where('employee_id', $employee->id)
                             ->where('assessment_type', 'self');
                    });
                }
            });

        $assessments = $query->orderBy('created_at', 'desc')->paginate(15);
        
        $statsQuery = \App\Models\CompetencyAssessment::where(function ($q) use ($user, $employee) {
            $q->where('assessor_id', $user->id);
            if ($employee) {
                $q->orWhere(function ($subQ) use ($employee) {
                    $subQ->where('employee_id', $employee->id)
                         ->where('assessment_type', 'self');
                });
            }
        });
        
        $stats = [
            'total' => (clone $statsQuery)->count(),
            'pending' => (clone $statsQuery)->where('status', 'draft')->count(),
            'completed' => (clone $statsQuery)->whereIn('status', ['submitted', 'approved'])->count(),
        ];

        return Inertia::render('Debug/MyAssessmentsDebug', [
            'assessments' => $assessments,
            'stats' => $stats,
            'employees' => \App\Models\Employee::with('user')->select('id', 'user_id')->get(),
            'assessmentCycles' => \App\Models\AssessmentCycle::where('is_active', true)->select('id', 'name')->orderBy('name')->get(),
            'statusOptions' => ['draft', 'submitted', 'approved', 'rejected'],
            'filters' => $request->only(['status', 'assessment_cycle_id'])
        ]);
    })->name('debug-my-assessments-page');
    
    // Debug route to test my assessments data
    Route::get('debug-my-assessments', function() {
        $user = Auth::user();
        $employee = \App\Models\Employee::where('user_id', $user->id)->first();
        
        $query = \App\Models\CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle'])
            ->where(function ($q) use ($user, $employee) {
                $q->where('assessor_id', $user->id);
                if ($employee) {
                    $q->orWhere(function ($subQ) use ($employee) {
                        $subQ->where('employee_id', $employee->id)
                             ->where('assessment_type', 'self');
                    });
                }
            });
        
        $assessments = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ],
            'employee_id' => $employee?->id,
            'total_assessments' => $assessments->count(),
            'assessments' => $assessments->map(function($assessment) {
                return [
                    'id' => $assessment->id,
                    'employee_name' => $assessment->employee->user->name,
                    'competency_name' => $assessment->competency->name,
                    'assessment_type' => $assessment->assessment_type,
                    'status' => $assessment->status,
                    'created_at' => $assessment->created_at
                ];
            })
        ]);
    })->name('debug-my-assessments');
    Route::get('pending-assessments', [CompetencyAssessmentController::class, 'pending'])->name('competency-assessments.pending');
    Route::post('competency-assessments/bulk-create', [CompetencyAssessmentController::class, 'bulkCreate'])->name('competency-assessments.bulk-create');
    Route::post('competency-assessments/bulk-submit', [CompetencyAssessmentController::class, 'bulkSubmit'])->name('competency-assessments.bulk-submit');
    Route::post('competency-assessments/bulk-approve', [CompetencyAssessmentController::class, 'bulkApprove'])->name('competency-assessments.bulk-approve');
    Route::get('competency-assessments/export', [CompetencyAssessmentController::class, 'export'])->name('competency-assessments.export');
    
    // Assessment Workflow routes
    Route::get('assessment-workflow', function () {
        return Inertia::render('Competency/AssessmentWorkflow');
    })->name('assessment-workflow');

    // Admin routes (Admin only)
    Route::middleware(['auth', 'role:Admin'])->prefix('admin')->name('admin.')->group(function () {
        // System Settings
        Route::get('system-settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'index'])->name('system-settings.index');
        Route::post('system-settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'update'])->name('system-settings.update');
        Route::post('system-settings/clear-cache', [App\Http\Controllers\Admin\SystemSettingsController::class, 'clearCache'])->name('system-settings.clear-cache');
        Route::post('system-settings/optimize', [App\Http\Controllers\Admin\SystemSettingsController::class, 'optimize'])->name('system-settings.optimize');
        Route::get('system-settings/health', [App\Http\Controllers\Admin\SystemSettingsController::class, 'health'])->name('system-settings.health');
        
        // Role Management
        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('roles/{user}/assign', [RoleController::class, 'assignRole'])->name('roles.assign');
        Route::post('roles/{user}/remove', [RoleController::class, 'removeRole'])->name('roles.remove');
    });
    

    Route::get('assessment-workflow/dashboard', [AssessmentWorkflowController::class, 'dashboard'])->name('assessment-workflow.dashboard');
    Route::post('competency-assessments/{competencyAssessment}/transition-status', [AssessmentWorkflowController::class, 'transitionStatus'])->name('assessment-workflow.transition-status');
    Route::post('assessment-workflow/bulk-process', [AssessmentWorkflowController::class, 'bulkProcess'])->name('assessment-workflow.bulk-process');
    Route::post('competency-assessments/{competencyAssessment}/extend-deadline', [AssessmentWorkflowController::class, 'extendDeadline'])->name('assessment-workflow.extend-deadline');
    Route::post('competency-assessments/{competencyAssessment}/reassign', [AssessmentWorkflowController::class, 'reassign'])->name('assessment-workflow.reassign');
    Route::get('competency-assessments/{competencyAssessment}/workflow-history', [AssessmentWorkflowController::class, 'getWorkflowHistory'])->name('assessment-workflow.history');
    Route::get('assessment-workflow/pending-approvals', [AssessmentWorkflowController::class, 'getPendingApprovals'])->name('assessment-workflow.pending-approvals');
    
    // Approval routes for dashboard
    Route::post('approvals/{id}/approve', [DashboardController::class, 'approveItem'])->name('approvals.approve');
    Route::post('approvals/{id}/reject', [DashboardController::class, 'rejectItem'])->name('approvals.reject');
    
    // Development Plan routes
    Route::resource('development-plans', CompetencyDevelopmentPlanController::class);
    Route::post('development-plans/{developmentPlan}/update-status', [CompetencyDevelopmentPlanController::class, 'updateStatus'])->name('development-plans.update-status');
    Route::post('development-plans/{developmentPlan}/add-action', [CompetencyDevelopmentPlanController::class, 'addAction'])->name('development-plans.add-action');
    Route::post('development-plans/{developmentPlan}/update-action', [CompetencyDevelopmentPlanController::class, 'updateAction'])->name('development-plans.update-action');
    Route::post('development-plans/{developmentPlan}/update-progress', [CompetencyDevelopmentPlanController::class, 'updateProgress'])->name('development-plans.update-progress');
    
    // Assessment Cycle routes
    Route::get('assessment-cycle-manager', [AssessmentCycleController::class, 'manager'])->name('assessment-cycle-manager');
    Route::resource('assessment-cycles', AssessmentCycleController::class)->except(['index']);
    Route::post('assessment-cycles/{assessmentCycle}/start', [AssessmentCycleController::class, 'start'])->name('assessment-cycles.start');
    Route::post('assessment-cycles/{assessmentCycle}/complete', [AssessmentCycleController::class, 'complete'])->name('assessment-cycles.complete');
    Route::post('assessment-cycles/{assessmentCycle}/cancel', [AssessmentCycleController::class, 'cancel'])->name('assessment-cycles.cancel');
    Route::post('assessment-cycles/{assessmentCycle}/extend-deadline', [AssessmentCycleController::class, 'extendDeadline'])->name('assessment-cycles.extend-deadline');
    Route::post('assessment-cycles/{assessmentCycle}/send-reminders', [AssessmentCycleController::class, 'sendReminders'])->name('assessment-cycles.send-reminders');
    Route::get('assessment-cycles/{assessmentCycle}/progress-report', [AssessmentCycleController::class, 'progressReport'])->name('assessment-cycles.progress-report');
    Route::post('assessment-cycles/{assessmentCycle}/duplicate', [AssessmentCycleController::class, 'duplicate'])->name('assessment-cycles.duplicate');
    
    // Competency Analytics routes
    Route::prefix('competency-analytics')->name('competency-analytics.')->group(function () {
        Route::get('/', [CompetencyAnalyticsController::class, 'index'])->name('index');
        Route::get('/dashboard', [CompetencyAnalyticsController::class, 'dashboard'])->name('dashboard');
        Route::get('/employee/{employee}', [CompetencyAnalyticsController::class, 'employee'])->name('employee');
        Route::get('/department/{department}', [CompetencyAnalyticsController::class, 'department'])->name('department');
        Route::get('/skill-gaps', [CompetencyAnalyticsController::class, 'skillGaps'])->name('skill-gaps');
        Route::get('/trends', [CompetencyAnalyticsController::class, 'trends'])->name('trends');
        Route::get('/compare', [CompetencyAnalyticsController::class, 'compare'])->name('compare');
        Route::get('/reports', [CompetencyAnalyticsController::class, 'reports'])->name('reports');
        Route::post('/generate-report', [CompetencyAnalyticsController::class, 'generateReport'])->name('generate-report');
        Route::post('/export', [CompetencyAnalyticsController::class, 'export'])->name('export');
        Route::get('/download/{filename}', [CompetencyAnalyticsController::class, 'download'])->name('download');
        Route::get('/insights', [CompetencyAnalyticsController::class, 'insights'])->name('insights');
        Route::get('/distribution', [CompetencyAnalyticsController::class, 'distribution'])->name('distribution');
        Route::post('/development-plans-report', [CompetencyAnalyticsController::class, 'developmentPlansReport'])->name('development-plans-report');
    });

    // Organizational Analytics routes
    Route::prefix('organizational-analytics')->name('organizational-analytics.')->group(function () {
        Route::get('/', [OrganizationalAnalyticsController::class, 'index'])->name('index');
        Route::post('/export', [OrganizationalAnalyticsController::class, 'export'])->name('export');
        Route::get('/download/{filename}', [OrganizationalAnalyticsController::class, 'download'])->name('download');
    });

    // Email Preferences routes
    Route::get('/email-preferences', [App\Http\Controllers\EmailPreferencesController::class, 'show'])->name('email-preferences.show');
    Route::put('/email-preferences', [App\Http\Controllers\EmailPreferencesController::class, 'update'])->name('email-preferences.update');
    
    // Support Request routes
    Route::get('/support', [App\Http\Controllers\SupportController::class, 'index'])->name('support.index');
    Route::get('/support/create', [App\Http\Controllers\SupportController::class, 'create'])->name('support.create');
    Route::post('/support', [App\Http\Controllers\SupportController::class, 'store'])->name('support.store');
    Route::get('/support/{supportRequest}', [App\Http\Controllers\SupportController::class, 'show'])->name('support.show');
    Route::patch('/support/{supportRequest}/status', [App\Http\Controllers\SupportController::class, 'updateStatus'])->name('support.update-status');
    
    // Legal pages routes
    Route::get('/legal/disclaimer', function () {
        return Inertia::render('Legal/Disclaimer');
    })->name('legal.disclaimer');
    Route::get('/legal/privacy', function () {
        return Inertia::render('Legal/PrivacyPolicy');
    })->name('legal.privacy');
});

require __DIR__.'/auth.php';
