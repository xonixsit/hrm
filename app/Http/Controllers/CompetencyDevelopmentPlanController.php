<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompetencyDevelopmentPlan;
use App\Models\Employee;
use App\Models\Competency;
use App\Services\CompetencyDevelopmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompetencyDevelopmentPlanController extends Controller
{
    protected CompetencyDevelopmentService $developmentService;

    public function __construct(CompetencyDevelopmentService $developmentService)
    {
        $this->developmentService = $developmentService;
    }

    /**
     * Display a listing of development plans.
     */
    public function index(Request $request): Response
    {
        $query = CompetencyDevelopmentPlan::with(['employee.user', 'competency', 'creator'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('competency_id')) {
            $query->where('competency_id', $request->competency_id);
        }

        $developmentPlans = $query->paginate(15);

        return Inertia::render('DevelopmentPlans/Index', [
            'developmentPlans' => $developmentPlans,
            'employees' => Employee::with('user')->get()->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name ?? 'Unknown'
                ];
            }),
            'competencies' => Competency::where('is_active', true)->select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['status', 'employee_id', 'competency_id'])
        ]);
    }

    /**
     * Show the form for creating a new development plan.
     */
    public function create(Request $request): Response
    {
        $employeeId = $request->get('employee_id');
        $employee = $employeeId ? Employee::with('user')->find($employeeId) : null;

        return Inertia::render('DevelopmentPlans/Create', [
            'employee' => $employee ? [
                'id' => $employee->id,
                'name' => $employee->user->name ?? 'Unknown'
            ] : null,
            'employees' => Employee::with('user')->get()->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name ?? 'Unknown'
                ];
            }),
            'competencies' => Competency::where('is_active', true)->select('id', 'name', 'category')->orderBy('name')->get()
        ]);
    }

    /**
     * Store a newly created development plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate(CompetencyDevelopmentPlan::validationRules());
        $validated['created_by'] = Auth::id();

        $developmentPlan = CompetencyDevelopmentPlan::create($validated);

        return redirect()->route('development-plans.show', $developmentPlan)
            ->with('success', 'Development plan created successfully.');
    }

    /**
     * Display the specified development plan.
     */
    public function show(CompetencyDevelopmentPlan $developmentPlan): Response
    {
        $developmentPlan->load(['employee.user', 'competency', 'creator']);

        return Inertia::render('DevelopmentPlans/Show', [
            'developmentPlan' => [
                'id' => $developmentPlan->id,
                'employee' => [
                    'id' => $developmentPlan->employee->id,
                    'name' => $developmentPlan->employee->user->name ?? 'Unknown'
                ],
                'competency' => [
                    'id' => $developmentPlan->competency->id,
                    'name' => $developmentPlan->competency->name,
                    'category' => $developmentPlan->competency->category
                ],
                'current_rating' => $developmentPlan->current_rating,
                'target_rating' => $developmentPlan->target_rating,
                'target_date' => $developmentPlan->target_date?->format('Y-m-d'),
                'status' => $developmentPlan->status,
                'development_actions' => $developmentPlan->development_actions ?? [],
                'progress_notes' => $developmentPlan->progress_notes,
                'progress_percentage' => $developmentPlan->getProgressPercentage(),
                'completed_actions_count' => $developmentPlan->getCompletedActionsCount(),
                'total_actions_count' => $developmentPlan->getTotalActionsCount(),
                'days_remaining' => $developmentPlan->getDaysRemaining(),
                'is_overdue' => $developmentPlan->isOverdue(),
                'creator' => [
                    'name' => $developmentPlan->creator->name ?? 'Unknown'
                ],
                'created_at' => $developmentPlan->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $developmentPlan->updated_at->format('Y-m-d H:i:s')
            ]
        ]);
    }

    /**
     * Show the form for editing the development plan.
     */
    public function edit(CompetencyDevelopmentPlan $developmentPlan): Response
    {
        $developmentPlan->load(['employee.user', 'competency']);

        return Inertia::render('DevelopmentPlans/Edit', [
            'developmentPlan' => [
                'id' => $developmentPlan->id,
                'employee_id' => $developmentPlan->employee_id,
                'competency_id' => $developmentPlan->competency_id,
                'current_rating' => $developmentPlan->current_rating,
                'target_rating' => $developmentPlan->target_rating,
                'target_date' => $developmentPlan->target_date?->format('Y-m-d'),
                'status' => $developmentPlan->status,
                'development_actions' => $developmentPlan->development_actions ?? [],
                'progress_notes' => $developmentPlan->progress_notes,
                'employee' => [
                    'id' => $developmentPlan->employee->id,
                    'name' => $developmentPlan->employee->user->name ?? 'Unknown'
                ],
                'competency' => [
                    'id' => $developmentPlan->competency->id,
                    'name' => $developmentPlan->competency->name,
                    'category' => $developmentPlan->competency->category
                ]
            ],
            'competencies' => Competency::where('is_active', true)->select('id', 'name', 'category')->orderBy('name')->get()
        ]);
    }

    /**
     * Update the specified development plan.
     */
    public function update(Request $request, CompetencyDevelopmentPlan $developmentPlan)
    {
        $rules = CompetencyDevelopmentPlan::validationRules();
        unset($rules['employee_id'], $rules['created_by']); // Don't allow changing employee or creator
        
        $validated = $request->validate($rules);

        $developmentPlan->update($validated);

        return redirect()->route('development-plans.show', $developmentPlan)
            ->with('success', 'Development plan updated successfully.');
    }

    /**
     * Remove the specified development plan.
     */
    public function destroy(CompetencyDevelopmentPlan $developmentPlan)
    {
        $developmentPlan->delete();

        return redirect()->route('development-plans.index')
            ->with('success', 'Development plan deleted successfully.');
    }

    /**
     * Update development plan status.
     */
    public function updateStatus(Request $request, CompetencyDevelopmentPlan $developmentPlan)
    {
        $request->validate([
            'status' => 'required|in:active,completed,paused,cancelled'
        ]);

        $developmentPlan->update(['status' => $request->status]);

        return back()->with('success', 'Development plan status updated successfully.');
    }

    /**
     * Add a development action to the plan.
     */
    public function addAction(Request $request, CompetencyDevelopmentPlan $developmentPlan)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'due_date' => 'nullable|date|after:today',
            'priority' => 'nullable|in:low,medium,high'
        ]);

        $action = [
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'priority' => $request->priority ?? 'medium'
        ];

        $developmentPlan->addDevelopmentAction($action);

        return back()->with('success', 'Development action added successfully.');
    }

    /**
     * Update a development action status.
     */
    public function updateAction(Request $request, CompetencyDevelopmentPlan $developmentPlan)
    {
        $request->validate([
            'action_id' => 'required|string',
            'status' => 'required|in:pending,in_progress,completed,cancelled'
        ]);

        $developmentPlan->updateDevelopmentAction($request->action_id, $request->status);

        return back()->with('success', 'Development action updated successfully.');
    }

    /**
     * Update current rating and progress.
     */
    public function updateProgress(Request $request, CompetencyDevelopmentPlan $developmentPlan)
    {
        $request->validate([
            'current_rating' => 'required|integer|between:1,5',
            'progress_notes' => 'nullable|string|max:2000'
        ]);

        $developmentPlan->updateCurrentRating($request->current_rating);
        
        if ($request->filled('progress_notes')) {
            $developmentPlan->update(['progress_notes' => $request->progress_notes]);
        }

        return back()->with('success', 'Progress updated successfully.');
    }
}