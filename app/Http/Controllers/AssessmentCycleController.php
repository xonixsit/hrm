<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AssessmentCycle;
use App\Models\Employee;
use App\Models\Competency;
use App\Models\CompetencyAssessment;
use App\Services\CompetencyAssessmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentCycleController extends Controller
{
    protected CompetencyAssessmentService $assessmentService;

    public function __construct(CompetencyAssessmentService $assessmentService)
    {
        $this->assessmentService = $assessmentService;
    }

    /**
     * Display the assessment cycle manager interface.
     */
    public function manager(Request $request): Response
    {
        // Get all assessment cycles with completion statistics
        $cycles = AssessmentCycle::with(['creator'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cycle) {
                $totalAssessments = CompetencyAssessment::where('assessment_cycle_id', $cycle->id)->count();
                $completedAssessments = CompetencyAssessment::where('assessment_cycle_id', $cycle->id)
                    ->where('status', 'submitted')
                    ->count();
                
                return [
                    'id' => $cycle->id,
                    'name' => $cycle->name,
                    'description' => $cycle->description,
                    'status' => $cycle->status,
                    'start_date' => $cycle->start_date,
                    'end_date' => $cycle->end_date,
                    'assessment_types' => $cycle->assessment_types,
                    'target_employees' => $cycle->target_employees,
                    'notification_settings' => $cycle->notification_settings,
                    'created_at' => $cycle->created_at,
                    'creator' => [
                        'id' => $cycle->creator->id,
                        'name' => $cycle->creator->name
                    ],
                    'participant_count' => is_array($cycle->target_employees) ? count($cycle->target_employees) : 0,
                    'assessment_count' => $totalAssessments,
                    'completion_percentage' => $totalAssessments > 0 ? round(($completedAssessments / $totalAssessments) * 100) : 0
                ];
            });

        // Get employees for participant selection
        $employees = Employee::with(['user', 'department'])
            ->where('status', 'active')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name ?? 'Unknown',
                    'position' => $employee->position,
                    'department' => $employee->department ? [
                        'id' => $employee->department->id,
                        'name' => $employee->department->name
                    ] : null
                ];
            });

        // Get competencies for assignment
        $competencies = Competency::where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(function ($competency) {
                return [
                    'id' => $competency->id,
                    'name' => $competency->name,
                    'description' => $competency->description,
                    'category' => $competency->category,
                    'weight' => $competency->weight
                ];
            });

        return Inertia::render('Competency/AssessmentCycleManager', [
            'cycles' => $cycles,
            'employees' => $employees,
            'competencies' => $competencies
        ]);
    }

    /**
     * Display a listing of assessment cycles.
     */
    public function index(Request $request): Response
    {
        $query = AssessmentCycle::with(['creator']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('end_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $cycles = $query->paginate(15)->withQueryString();

        // Add completion statistics for each cycle
        $cycles->getCollection()->transform(function ($cycle) {
            $cycle->completion_stats = $this->getCycleCompletionStats($cycle);
            return $cycle;
        });

        return Inertia::render('AssessmentCycles/Index', [
            'cycles' => $cycles,
            'statusOptions' => ['planned', 'active', 'completed', 'cancelled'],
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search', 'sort_by', 'sort_order']),
            'stats' => $this->getCycleStats()
        ]);
    }

    /**
     * Show the form for creating a new assessment cycle.
     */
    public function create(): Response
    {
        return Inertia::render('AssessmentCycles/Create', [
            'employees' => Employee::with('user')->select('id', 'user_id')->get(),
            'competencies' => Competency::where('is_active', true)->select('id', 'name', 'category')->get(),
            'assessmentTypes' => ['self', 'manager', 'peer', '360'],
            'defaultNotificationSettings' => $this->getDefaultNotificationSettings()
        ]);
    }

    /**
     * Store a newly created assessment cycle.
     */
    public function store(Request $request)
    {
        try {
            $validated = $this->validateCycleRequest($request);
            $validated['created_by'] = Auth::id();

            $cycle = $this->assessmentService->createAssessmentCycle($validated);

            return redirect()->route('assessment-cycles.show', $cycle->id)
                ->with('success', 'Assessment cycle created successfully.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create assessment cycle: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified assessment cycle.
     */
    public function show(AssessmentCycle $assessmentCycle): Response
    {
        $assessmentCycle->load(['creator']);

        // Get cycle assessments with pagination
        $assessments = CompetencyAssessment::where('assessment_cycle_id', $assessmentCycle->id)
            ->with(['employee.user', 'competency', 'assessor'])
            ->paginate(20);

        return Inertia::render('AssessmentCycles/Show', [
            'cycle' => $assessmentCycle,
            'assessments' => $assessments,
            'completionStats' => $this->getCycleCompletionStats($assessmentCycle),
            'progressData' => $this->getCycleProgressData($assessmentCycle),
            'canManage' => $this->canManageCycle($assessmentCycle)
        ]);
    }

    /**
     * Show the form for editing the specified assessment cycle.
     */
    public function edit(AssessmentCycle $assessmentCycle): Response
    {
        if (!$this->canManageCycle($assessmentCycle)) {
            abort(403, 'You are not authorized to edit this assessment cycle.');
        }

        if ($assessmentCycle->status === 'completed') {
            abort(422, 'Cannot edit completed assessment cycles.');
        }

        return Inertia::render('AssessmentCycles/Edit', [
            'cycle' => $assessmentCycle,
            'employees' => Employee::with('user')->select('id', 'user_id')->get(),
            'competencies' => Competency::where('is_active', true)->select('id', 'name', 'category')->get(),
            'assessmentTypes' => ['self', 'manager', 'peer', '360']
        ]);
    }

    /**
     * Update the specified assessment cycle.
     */
    public function update(Request $request, AssessmentCycle $assessmentCycle)
    {
        if (!$this->canManageCycle($assessmentCycle)) {
            return redirect()->back()
                ->with('error', 'You are not authorized to edit this assessment cycle.');
        }

        if ($assessmentCycle->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot edit completed assessment cycles.');
        }

        try {
            $validated = $this->validateCycleRequest($request, $assessmentCycle);

            // Preserve existing values for fields not provided
            if (!isset($validated['assessment_types'])) {
                $validated['assessment_types'] = $assessmentCycle->assessment_types;
            }
            if (!isset($validated['target_employees'])) {
                $validated['target_employees'] = $assessmentCycle->target_employees;
            }
            if (!isset($validated['competencies'])) {
                $validated['competencies'] = $assessmentCycle->competencies;
            }
            if (!isset($validated['notification_settings'])) {
                $validated['notification_settings'] = $assessmentCycle->notification_settings;
            }

            $assessmentCycle->update($validated);

            return redirect()->route('assessment-cycles.show', $assessmentCycle->id)
                ->with('success', 'Assessment cycle updated successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update assessment cycle: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified assessment cycle from storage.
     */
    public function destroy(AssessmentCycle $assessmentCycle): JsonResponse
    {
        if (!$this->canManageCycle($assessmentCycle)) {
            return response()->json([
                'message' => 'You are not authorized to delete this assessment cycle.'
            ], 403);
        }

        if ($assessmentCycle->status === 'active' || $assessmentCycle->status === 'completed') {
            return response()->json([
                'message' => 'Cannot delete active or completed assessment cycles.'
            ], 422);
        }

        // Check if cycle has assessments
        if ($assessmentCycle->assessments()->exists()) {
            return response()->json([
                'message' => 'Cannot delete assessment cycle with existing assessments.'
            ], 422);
        }

        $assessmentCycle->delete();

        return response()->json([
            'message' => 'Assessment cycle deleted successfully.'
        ]);
    }

    /**
     * Start an assessment cycle.
     */
    public function start(AssessmentCycle $assessmentCycle)
    {
        \Log::info('=== START CYCLE REQUEST ===', ['cycle_id' => $assessmentCycle->id, 'cycle_name' => $assessmentCycle->name]);
        
        if (!$this->canManageCycle($assessmentCycle)) {
            \Log::error('User not authorized to start cycle', ['user_id' => Auth::id(), 'cycle_id' => $assessmentCycle->id]);
            return redirect()->back()
                ->with('error', 'You are not authorized to start this assessment cycle.');
        }

        try {
            \Log::info('Calling service to start cycle');
            // Allow admin override for future start dates
            $adminOverride = Auth::user()->hasRole('Admin');
            $cycle = $this->assessmentService->startAssessmentCycle($assessmentCycle, $adminOverride);
            \Log::info('Cycle started successfully', ['cycle_id' => $cycle->id, 'new_status' => $cycle->status]);

            return redirect()->route('assessment-cycles.show', $cycle->id)
                ->with('success', 'Assessment cycle started successfully.');

        } catch (ValidationException $e) {
            \Log::error('Validation error starting cycle', ['errors' => $e->errors()]);
            return redirect()->back()
                ->withErrors($e->errors());

        } catch (\Exception $e) {
            \Log::error('Exception starting cycle', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()
                ->with('error', 'Failed to start assessment cycle: ' . $e->getMessage());
        }
    }

    /**
     * Complete an assessment cycle.
     */
    public function complete(Request $request, AssessmentCycle $assessmentCycle)
    {
        \Log::info('=== COMPLETE CYCLE REQUEST ===', ['cycle_id' => $assessmentCycle->id, 'cycle_name' => $assessmentCycle->name]);
        
        if (!$this->canManageCycle($assessmentCycle)) {
            \Log::error('User not authorized to complete cycle', ['user_id' => Auth::id(), 'cycle_id' => $assessmentCycle->id]);
            return redirect()->back()
                ->with('error', 'You are not authorized to complete this assessment cycle.');
        }

        try {
            $forceComplete = $request->boolean('force_complete', false);
            \Log::info('Calling service to complete cycle', ['force_complete' => $forceComplete]);
            $cycle = $this->assessmentService->completeAssessmentCycle($assessmentCycle, $forceComplete);
            \Log::info('Cycle completed successfully', ['cycle_id' => $cycle->id, 'new_status' => $cycle->status]);

            return redirect()->route('assessment-cycles.show', $cycle->id)
                ->with('success', 'Assessment cycle completed successfully.');

        } catch (ValidationException $e) {
            \Log::error('Validation error completing cycle', ['errors' => $e->errors()]);
            return redirect()->back()
                ->withErrors($e->errors());

        } catch (\Exception $e) {
            \Log::error('Exception completing cycle', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()
                ->with('error', 'Failed to complete assessment cycle: ' . $e->getMessage());
        }
    }

    /**
     * Cancel an assessment cycle.
     */
    public function cancel(Request $request, AssessmentCycle $assessmentCycle)
    {
        if (!$this->canManageCycle($assessmentCycle)) {
            return redirect()->back()
                ->with('error', 'You are not authorized to cancel this assessment cycle.');
        }

        if ($assessmentCycle->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot cancel completed assessment cycles.');
        }

        try {
            $validated = $request->validate([
                'cancellation_reason' => 'required|string|max:500'
            ]);

            $assessmentCycle->update([
                'status' => 'cancelled',
                'description' => $assessmentCycle->description . "\n\nCancelled: " . $validated['cancellation_reason']
            ]);

            return redirect()->route('assessment-cycles.show', $assessmentCycle->id)
                ->with('success', 'Assessment cycle cancelled successfully.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors());

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to cancel assessment cycle: ' . $e->getMessage());
        }
    }

    /**
     * Extend the deadline of an assessment cycle.
     */
    public function extendDeadline(Request $request, AssessmentCycle $assessmentCycle): JsonResponse
    {
        if (!$this->canManageCycle($assessmentCycle)) {
            return response()->json([
                'message' => 'You are not authorized to extend this assessment cycle.'
            ], 403);
        }

        if ($assessmentCycle->status !== 'active') {
            return response()->json([
                'message' => 'Can only extend active assessment cycles.'
            ], 422);
        }

        try {
            $validated = $request->validate([
                'new_end_date' => 'required|date|after:' . $assessmentCycle->end_date,
                'extension_reason' => 'required|string|max:500'
            ]);

            $assessmentCycle->update([
                'end_date' => $validated['new_end_date'],
                'description' => $assessmentCycle->description . "\n\nExtended to {$validated['new_end_date']}: " . $validated['extension_reason']
            ]);

            return response()->json([
                'message' => 'Assessment cycle deadline extended successfully.',
                'cycle' => $assessmentCycle->load(['creator'])
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to extend assessment cycle deadline.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send reminder notifications for overdue assessments in a cycle.
     */
    public function sendReminders(AssessmentCycle $assessmentCycle)
    {
        if (!$this->canManageCycle($assessmentCycle)) {
            return redirect()->back()
                ->with('error', 'You are not authorized to send reminders for this assessment cycle.');
        }

        try {
            $remindersSent = $this->assessmentService->sendOverdueReminders($assessmentCycle);

            return redirect()->back()
                ->with('success', "Successfully sent {$remindersSent} reminder notification" . ($remindersSent !== 1 ? 's' : '') . ".");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to send reminder notifications: ' . $e->getMessage());
        }
    }

    /**
     * Get cycle progress report.
     */
    public function progressReport(AssessmentCycle $assessmentCycle): JsonResponse
    {
        $progressData = $this->getCycleProgressData($assessmentCycle);
        $completionStats = $this->getCycleCompletionStats($assessmentCycle);

        return response()->json([
            'cycle' => $assessmentCycle,
            'progress' => $progressData,
            'completion' => $completionStats,
            'overdue_assessments' => $this->assessmentService->getOverdueAssessments($assessmentCycle)
        ]);
    }

    /**
     * Duplicate an assessment cycle.
     */
    public function duplicate(AssessmentCycle $assessmentCycle): JsonResponse
    {
        if (!$this->canManageCycle($assessmentCycle)) {
            return response()->json([
                'message' => 'You are not authorized to duplicate this assessment cycle.'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $newCycle = $assessmentCycle->replicate();
            $newCycle->name = $assessmentCycle->name . ' (Copy)';
            $newCycle->status = 'planned';
            $newCycle->start_date = now()->addDays(7);
            $newCycle->end_date = now()->addDays(21);
            $newCycle->created_by = Auth::id();
            $newCycle->save();

            DB::commit();

            return response()->json([
                'message' => 'Assessment cycle duplicated successfully.',
                'cycle' => $newCycle->load(['creator'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to duplicate assessment cycle.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate cycle request data.
     */
    private function validateCycleRequest(Request $request, ?AssessmentCycle $cycle = null): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'assessment_types' => $cycle ? 'nullable|array' : 'required|array',
            'assessment_types.*' => 'in:self,manager,peer,360',
            'target_employees' => 'nullable|array',
            'target_employees.*' => 'exists:employees,id',
            'competencies' => 'nullable|array',
            'competencies.*' => 'exists:competencies,id',
            'notification_settings' => 'nullable|array'
        ];

        // Add unique constraint for new cycles
        if (!$cycle) {
            $rules['name'] = 'required|string|max:255|unique:assessment_cycles,name';
        } else {
            $rules['name'] = 'required|string|max:255|unique:assessment_cycles,name,' . $cycle->id;
        }

        return $request->validate($rules);
    }

    /**
     * Check if the current user can manage the cycle.
     */
    private function canManageCycle(AssessmentCycle $cycle): bool
    {
        $user = Auth::user();
        
        // Cycle creator can manage their own cycles
        if ($cycle->created_by === $user->id) {
            return true;
        }

        // HR admins can manage all cycles
        return $user->hasRole(['HR Admin']) ?? false;
    }

    /**
     * Get cycle completion statistics.
     */
    private function getCycleCompletionStats(AssessmentCycle $cycle): array
    {
        $totalAssessments = $cycle->assessments()->count();
        $draftAssessments = $cycle->assessments()->where('status', 'draft')->count();
        $submittedAssessments = $cycle->assessments()->where('status', 'submitted')->count();
        $approvedAssessments = $cycle->assessments()->where('status', 'approved')->count();
        $rejectedAssessments = $cycle->assessments()->where('status', 'rejected')->count();

        return [
            'total_assessments' => $totalAssessments,
            'draft_assessments' => $draftAssessments,
            'submitted_assessments' => $submittedAssessments,
            'approved_assessments' => $approvedAssessments,
            'rejected_assessments' => $rejectedAssessments,
            'completion_percentage' => $totalAssessments > 0 ? round(($submittedAssessments + $approvedAssessments) / $totalAssessments * 100, 2) : 0,
            'approval_percentage' => $totalAssessments > 0 ? round($approvedAssessments / $totalAssessments * 100, 2) : 0
        ];
    }

    /**
     * Get cycle progress data for charts.
     */
    private function getCycleProgressData(AssessmentCycle $cycle): array
    {
        // Get daily progress data
        $dailyProgress = DB::table('competency_assessments')
            ->where('assessment_cycle_id', $cycle->id)
            ->selectRaw('DATE(submitted_at) as date, COUNT(*) as count')
            ->whereNotNull('submitted_at')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get progress by assessment type
        $typeProgress = DB::table('competency_assessments')
            ->where('assessment_cycle_id', $cycle->id)
            ->selectRaw('assessment_type, status, COUNT(*) as count')
            ->groupBy('assessment_type', 'status')
            ->get();

        return [
            'daily_progress' => $dailyProgress,
            'type_progress' => $typeProgress
        ];
    }

    /**
     * Get overall cycle statistics.
     */
    private function getCycleStats(): array
    {
        return [
            'total_cycles' => AssessmentCycle::count(),
            'planned_cycles' => AssessmentCycle::where('status', 'planned')->count(),
            'active_cycles' => AssessmentCycle::where('status', 'active')->count(),
            'completed_cycles' => AssessmentCycle::where('status', 'completed')->count(),
            'cancelled_cycles' => AssessmentCycle::where('status', 'cancelled')->count(),
            'cycles_this_month' => AssessmentCycle::whereMonth('created_at', now()->month)->count()
        ];
    }

    /**
     * Get default notification settings.
     */
    private function getDefaultNotificationSettings(): array
    {
        return [
            'cycle_start_notification' => true,
            'reminder_notifications' => true,
            'reminder_frequency_days' => 3,
            'overdue_notifications' => true,
            'completion_notification' => true,
            'notify_managers' => true,
            'notify_hr' => true
        ];
    }
}