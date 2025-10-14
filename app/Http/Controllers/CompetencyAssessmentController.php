<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompetencyAssessment;
use App\Models\AssessmentCycle;
use App\Models\Employee;
use App\Models\Competency;
use App\Models\User;
use App\Services\CompetencyAssessmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CompetencyAssessmentController extends Controller
{
    protected CompetencyAssessmentService $assessmentService;

    public function __construct(CompetencyAssessmentService $assessmentService)
    {
        $this->assessmentService = $assessmentService;
    }

    /**
     * Display the assessment dashboard with statistics and overview.
     */
    public function dashboard(Request $request): Response
    {
        // Get assessment statistics
        $stats = [
            'totalAssessments' => CompetencyAssessment::count(),
            'pendingAssessments' => CompetencyAssessment::where('status', 'draft')->count(),
            'activeCycles' => AssessmentCycle::where('status', 'active')->count(),
            'completionRate' => $this->calculateCompletionRate(),
            'assessmentTrend' => $this->calculateAssessmentTrend()
        ];

        // Get pending assessments with relationships
        $pendingAssessments = CompetencyAssessment::with(['employee.user', 'competency', 'assessor'])
            ->where('status', 'draft')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'employee' => [
                        'id' => $assessment->employee->id,
                        'name' => $assessment->employee->user->name ?? 'Unknown'
                    ],
                    'competency' => [
                        'id' => $assessment->competency->id,
                        'name' => $assessment->competency->name
                    ],
                    'assessment_type' => $assessment->assessment_type,
                    'due_date' => $assessment->created_at->addDays(7), // Assuming 7 days to complete
                    'created_at' => $assessment->created_at
                ];
            });

        // Get active assessment cycles with progress
        $assessmentCycles = AssessmentCycle::where('status', 'active')
            ->orderBy('start_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($cycle) {
                $totalAssessments = CompetencyAssessment::where('assessment_cycle_id', $cycle->id)->count();
                $completedAssessments = CompetencyAssessment::where('assessment_cycle_id', $cycle->id)
                    ->where('status', 'submitted')
                    ->count();
                
                return [
                    'id' => $cycle->id,
                    'name' => $cycle->name,
                    'status' => $cycle->status,
                    'start_date' => $cycle->start_date,
                    'end_date' => $cycle->end_date,
                    'completion_percentage' => $totalAssessments > 0 ? round(($completedAssessments / $totalAssessments) * 100) : 0
                ];
            });

        // Get recent activity
        $recentActivity = CompetencyAssessment::with(['employee.user', 'competency'])
            ->whereIn('status', ['submitted', 'approved'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($assessment) {
                $action = $assessment->status === 'submitted' ? 'submitted' : 'approved';
                return [
                    'id' => $assessment->id,
                    'type' => 'assessment_' . $action,
                    'description' => $assessment->employee->user->name . ' ' . $action . ' assessment for ' . $assessment->competency->name,
                    'created_at' => $assessment->updated_at
                ];
            });

        return Inertia::render('Competency/AssessmentDashboard', [
            'stats' => $stats,
            'pendingAssessments' => $pendingAssessments,
            'assessmentCycles' => $assessmentCycles,
            'recentActivity' => $recentActivity
        ]);
    }

    /**
     * Calculate the overall completion rate for assessments.
     */
    private function calculateCompletionRate(): float
    {
        $totalAssessments = CompetencyAssessment::count();
        if ($totalAssessments === 0) {
            return 0;
        }

        $completedAssessments = CompetencyAssessment::whereIn('status', ['submitted', 'approved'])->count();
        return round(($completedAssessments / $totalAssessments) * 100, 1);
    }

    /**
     * Calculate the assessment trend (percentage change from last month).
     */
    private function calculateAssessmentTrend(): float
    {
        $currentMonth = CompetencyAssessment::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $lastMonth = CompetencyAssessment::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        if ($lastMonth === 0) {
            return $currentMonth > 0 ? 100 : 0;
        }

        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    /**
     * Show the form for creating a new assessment (selection form).
     */
    public function create(Request $request): Response
    {
        // Get employees and competencies for selection
        $employees = Employee::with(['user', 'department'])
            ->whereHas('user')
            ->orderBy('id')
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

        $competencies = Competency::where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(function ($competency) {
                return [
                    'id' => $competency->id,
                    'name' => $competency->name,
                    'category' => $competency->category,
                    'description' => $competency->description
                ];
            });

        $assessmentCycles = AssessmentCycle::where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(function ($cycle) {
                return [
                    'id' => $cycle->id,
                    'name' => $cycle->name,
                    'start_date' => $cycle->start_date,
                    'end_date' => $cycle->end_date
                ];
            });

        // Get departments for filtering
        $departments = \App\Models\Department::orderBy('name')
            ->get()
            ->map(function ($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name
                ];
            });

        return Inertia::render('CompetencyAssessments/Create', [
            'employees' => $employees,
            'competencies' => $competencies,
            'assessmentCycles' => $assessmentCycles,
            'departments' => $departments
        ]);
    }

    /**
     * Show the form for creating a self-assessment for the current user.
     */
    public function createSelfAssessment(Request $request): Response
    {
        $user = Auth::user();
        
        // Find the employee record for the current user
        $employee = Employee::where('user_id', $user->id)->with(['user', 'department'])->first();
        
        if (!$employee) {
            return redirect()->route('assessment-dashboard')
                ->with('error', 'No employee record found for your account. Please contact HR.');
        }

        // Get a default competency or let user select
        $competencies = Competency::where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        if ($competencies->isEmpty()) {
            return redirect()->route('assessment-dashboard')
                ->with('error', 'No competencies available for assessment.');
        }

        // If competency_id is provided, use it; otherwise use the first one
        $competencyId = $request->get('competency_id', $competencies->first()->id);
        $competency = $competencies->find($competencyId);

        if (!$competency) {
            return redirect()->route('assessment-dashboard')
                ->with('error', 'Selected competency not found.');
        }

        // Get assessment cycles
        $assessmentCycles = AssessmentCycle::where('status', 'active')
            ->orderBy('name')
            ->get();

        // Get previous assessments
        $previousAssessments = CompetencyAssessment::with(['assessor'])
            ->where('employee_id', $employee->id)
            ->where('competency_id', $competency->id)
            ->where('status', 'submitted')
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Competency/AssessmentForm', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->user->name ?? 'Unknown',
                'position' => $employee->position,
                'department' => $employee->department ? [
                    'id' => $employee->department->id,
                    'name' => $employee->department->name
                ] : null
            ],
            'competency' => [
                'id' => $competency->id,
                'name' => $competency->name,
                'description' => $competency->description,
                'category' => $competency->category,
                'weight' => $competency->weight,
                'measurement_indicators' => $competency->measurement_indicators,
                'rating_guidelines' => $competency->rating_guidelines
            ],
            'assessmentType' => 'self',
            'assessmentCycle' => null,
            'existingAssessment' => null,
            'availableCompetencies' => $competencies->map(function ($comp) {
                return [
                    'id' => $comp->id,
                    'name' => $comp->name,
                    'category' => $comp->category
                ];
            }),
            'previousAssessments' => $previousAssessments->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'rating' => $assessment->rating,
                    'submitted_at' => $assessment->submitted_at,
                    'assessor' => [
                        'id' => $assessment->assessor->id,
                        'name' => $assessment->assessor->name
                    ]
                ];
            })
        ]);
    }

    /**
     * Show the form for creating a new assessment.
     */
    public function createForm(Request $request): Response
    {
        // If no parameters provided, redirect to assessment dashboard
        if (!$request->has(['employee_id', 'competency_id'])) {
            return redirect()->route('assessment-dashboard')
                ->with('error', 'Please select an employee and competency to create an assessment.');
        }

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'assessment_type' => 'sometimes|in:self,manager,peer,360',
            'assessment_cycle_id' => 'sometimes|exists:assessment_cycles,id'
        ]);

        $employee = Employee::with(['user', 'department'])->findOrFail($request->employee_id);
        $competency = Competency::with(['department'])->findOrFail($request->competency_id);
        $assessmentCycle = $request->assessment_cycle_id 
            ? AssessmentCycle::findOrFail($request->assessment_cycle_id) 
            : null;

        // Get previous assessments for this employee and competency
        $previousAssessments = CompetencyAssessment::with(['assessor'])
            ->where('employee_id', $employee->id)
            ->where('competency_id', $competency->id)
            ->where('status', 'submitted')
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Competency/AssessmentForm', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->user->name ?? 'Unknown',
                'position' => $employee->position,
                'department' => $employee->department ? [
                    'id' => $employee->department->id,
                    'name' => $employee->department->name
                ] : null
            ],
            'competency' => [
                'id' => $competency->id,
                'name' => $competency->name,
                'description' => $competency->description,
                'category' => $competency->category,
                'weight' => $competency->weight,
                'measurement_indicators' => $competency->measurement_indicators,
                'rating_guidelines' => $competency->rating_guidelines
            ],
            'assessmentType' => $request->assessment_type ?? 'manager',
            'assessmentCycle' => $assessmentCycle ? [
                'id' => $assessmentCycle->id,
                'name' => $assessmentCycle->name,
                'start_date' => $assessmentCycle->start_date,
                'end_date' => $assessmentCycle->end_date
            ] : null,
            'existingAssessment' => null, // For new assessments
            'previousAssessments' => $previousAssessments->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'rating' => $assessment->rating,
                    'submitted_at' => $assessment->submitted_at,
                    'assessor' => [
                        'id' => $assessment->assessor->id,
                        'name' => $assessment->assessor->name
                    ]
                ];
            })
        ]);
    }

    /**
     * Show the form for editing an existing assessment.
     */
    public function editForm(CompetencyAssessment $competencyAssessment): Response
    {
        $competencyAssessment->load(['employee.user', 'employee.department', 'competency', 'assessmentCycle']);

        // Get previous assessments for this employee and competency
        $previousAssessments = CompetencyAssessment::with(['assessor'])
            ->where('employee_id', $competencyAssessment->employee_id)
            ->where('competency_id', $competencyAssessment->competency_id)
            ->where('status', 'submitted')
            ->where('id', '!=', $competencyAssessment->id)
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Competency/AssessmentForm', [
            'employee' => [
                'id' => $competencyAssessment->employee->id,
                'name' => $competencyAssessment->employee->user->name ?? 'Unknown',
                'position' => $competencyAssessment->employee->position,
                'department' => $competencyAssessment->employee->department ? [
                    'id' => $competencyAssessment->employee->department->id,
                    'name' => $competencyAssessment->employee->department->name
                ] : null
            ],
            'competency' => [
                'id' => $competencyAssessment->competency->id,
                'name' => $competencyAssessment->competency->name,
                'description' => $competencyAssessment->competency->description,
                'category' => $competencyAssessment->competency->category,
                'weight' => $competencyAssessment->competency->weight,
                'measurement_indicators' => $competencyAssessment->competency->measurement_indicators,
                'rating_guidelines' => $competencyAssessment->competency->rating_guidelines
            ],
            'assessmentType' => $competencyAssessment->assessment_type,
            'assessmentCycle' => $competencyAssessment->assessmentCycle ? [
                'id' => $competencyAssessment->assessmentCycle->id,
                'name' => $competencyAssessment->assessmentCycle->name,
                'start_date' => $competencyAssessment->assessmentCycle->start_date,
                'end_date' => $competencyAssessment->assessmentCycle->end_date
            ] : null,
            'existingAssessment' => [
                'id' => $competencyAssessment->id,
                'rating' => $competencyAssessment->rating,
                'comments' => $competencyAssessment->comments,
                'evidence_files' => $competencyAssessment->evidence_files,
                'development_notes' => $competencyAssessment->development_notes,
                'status' => $competencyAssessment->status
            ],
            'previousAssessments' => $previousAssessments->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'rating' => $assessment->rating,
                    'submitted_at' => $assessment->submitted_at,
                    'assessor' => [
                        'id' => $assessment->assessor->id,
                        'name' => $assessment->assessor->name
                    ]
                ];
            })
        ]);
    }

    /**
     * Display a listing of assessments with filtering and search.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();
        
        $query = CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle']);
        
        // Apply Role-Based Access Control
        if (!$user->hasRole(['admin', 'hr', 'Admin', 'HR'])) {
            // For non-admin/HR users, only show assessments they're involved in
            $query->where(function ($q) use ($user, $employee) {
                // Include assessments where user is the assessor
                $q->where('assessor_id', $user->id);
                
                // Include self-assessments where user is the employee being assessed
                if ($employee) {
                    $q->orWhere(function ($subQ) use ($employee) {
                        $subQ->where('employee_id', $employee->id)
                             ->where('assessment_type', 'self');
                    });
                }
            });
        }

        // Apply filters
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('competency_id')) {
            $query->where('competency_id', $request->competency_id);
        }

        if ($request->filled('assessor_id')) {
            $query->where('assessor_id', $request->assessor_id);
        }

        if ($request->filled('assessment_cycle_id')) {
            $query->where('assessment_cycle_id', $request->assessment_cycle_id);
        }

        if ($request->filled('assessment_type')) {
            $query->where('assessment_type', $request->assessment_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('employee.user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('competency', function ($compQuery) use ($search) {
                    $compQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhere('comments', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $assessments = $query->paginate(15)->withQueryString();

        return Inertia::render('CompetencyAssessments/Index', [
            'assessments' => $assessments,
            'employees' => Employee::with('user')->select('id', 'user_id')->get(),
            'competencies' => Competency::where('is_active', true)->select('id', 'name')->orderBy('name')->get(),
            'assessmentCycles' => AssessmentCycle::select('id', 'name')->orderBy('name')->get(),
            'assessors' => User::select('id', 'name')->orderBy('name')->get(),
            'assessmentTypes' => ['self', 'manager', 'peer', '360'],
            'statusOptions' => ['draft', 'submitted', 'approved', 'rejected'],
            'filters' => $request->only([
                'employee_id', 'competency_id', 'assessor_id', 'assessment_cycle_id',
                'assessment_type', 'status', 'rating', 'date_from', 'date_to', 'search',
                'sort_by', 'sort_order'
            ]),
            'stats' => $this->getAssessmentStats($user, $employee)
        ]);
    }

    /**
     * Store a newly created assessment.
     */
    public function store(Request $request)
    {
        \Log::info('Assessment creation started', [
            'request_data' => $request->all(),
            'user_id' => Auth::id(),
            'is_inertia' => $request->header('X-Inertia'),
            'expects_json' => $request->expectsJson()
        ]);
        
        // Log the incoming request for debugging
        \Log::info('=== STORE REQUEST DEBUG ===', [
            'all_data' => $request->all(),
            'is_inertia' => $request->header('X-Inertia'),
            'method' => $request->method(),
            'url' => $request->url()
        ]);

        // Manual validation with proper Inertia error handling
        $validator = \Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'assessment_type' => 'required|in:self,manager,peer,360',
            'assessment_cycle_id' => 'nullable|exists:assessment_cycles,id',
            'rating' => 'nullable|integer|min:1|max:5',
            'comments' => 'nullable|string|max:2000',
            'evidence_files' => 'nullable|array',
            'development_notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:draft,submitted'
        ], [
            'employee_id.required' => 'Please select an employee.',
            'employee_id.exists' => 'The selected employee is invalid.',
            'competency_id.required' => 'Please select a competency.',
            'competency_id.exists' => 'The selected competency is invalid.',
            'assessment_type.required' => 'Please select an assessment type.',
            'assessment_type.in' => 'The selected assessment type is invalid.',
        ]);

        if ($validator->fails()) {
            \Log::error('=== VALIDATION FAILED ===', [
                'errors' => $validator->errors()->toArray(),
                'input' => $request->all()
            ]);
            
            return redirect()->back()
                ->withErrors($validator->errors())
                ->withInput($request->input());
        }

        $validated = $validator->validated();

        \Log::info('=== VALIDATION PASSED ===', ['validated_data' => $validated]);
        
        try {
            // Determine the assessor ID based on assessment type
            $assessorId = Auth::id();
            if ($validated['assessment_type'] === 'self') {
                // For self-assessments, ensure the assessor is the employee's user
                $employee = Employee::findOrFail($validated['employee_id']);
                $assessorId = $employee->user_id;
                
                // Verify the current user is the employee being assessed
                if ($assessorId !== Auth::id()) {
                    return redirect()->back()
                        ->with('error', 'You can only create self-assessments for yourself.')
                        ->withInput();
                }
            }
            
            // Check if assessment already exists for this combination
            $existingAssessment = CompetencyAssessment::where([
                'employee_id' => $validated['employee_id'],
                'competency_id' => $validated['competency_id'],
                'assessor_id' => $assessorId,
                'assessment_cycle_id' => $validated['assessment_cycle_id']
            ])->first();

            if ($existingAssessment) {
                // Update existing assessment
                $existingAssessment->update([
                    'rating' => $validated['rating'] ?? $existingAssessment->rating,
                    'comments' => $validated['comments'] ?? $existingAssessment->comments,
                    'evidence_files' => $validated['evidence_files'] ?? $existingAssessment->evidence_files,
                    'development_notes' => $validated['development_notes'] ?? $existingAssessment->development_notes,
                    'status' => $validated['status'] ?? $existingAssessment->status,
                ]);

                \Log::info('=== ASSESSMENT UPDATED ===', ['assessment_id' => $existingAssessment->id]);

                return redirect()->route('competency-assessments.evaluate', $existingAssessment->id)
                    ->with('success', 'Assessment updated successfully.');
            }

            // Create new assessment
            $assessment = CompetencyAssessment::create([
                'employee_id' => $validated['employee_id'],
                'competency_id' => $validated['competency_id'],
                'assessor_id' => $assessorId,
                'assessment_cycle_id' => $validated['assessment_cycle_id'],
                'assessment_type' => $validated['assessment_type'],
                'rating' => $validated['rating'],
                'comments' => $validated['comments'],
                'evidence_files' => $validated['evidence_files'] ?? [],
                'development_notes' => $validated['development_notes'],
                'status' => $validated['status'] ?? 'draft',
            ]);
            
            \Log::info('=== ASSESSMENT CREATED ===', ['assessment_id' => $assessment->id]);

            return redirect()->route('competency-assessments.evaluate', $assessment->id)
                ->with('success', 'Assessment created successfully.');

        } catch (\Exception $e) {
            \Log::error('Assessment creation failed', [
                'error' => $e->getMessage(), 
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return redirect()->back()
                ->with('error', 'Failed to create assessment: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified assessment.
     */
    public function show(CompetencyAssessment $competencyAssessment): Response
    {
        $competencyAssessment->load([
            'employee.user',
            'competency.department',
            'assessor',
            'assessmentCycle'
        ]);

        return Inertia::render('CompetencyAssessments/Show', [
            'assessment' => $competencyAssessment,
            'canEdit' => $this->canEditAssessment($competencyAssessment),
            'canApprove' => $this->canApproveAssessment($competencyAssessment),
            'relatedAssessments' => $this->getRelatedAssessments($competencyAssessment)
        ]);
    }

    /**
     * Show the evaluation form for the specified assessment.
     */
    public function evaluate(CompetencyAssessment $competencyAssessment): Response
    {
        // Check if user can view this assessment (more permissive than editing)
        if (!$this->canViewAssessment($competencyAssessment)) {
            abort(403, 'You are not authorized to view this assessment.');
        }
        
        // Check if user can edit (only for draft assessments)
        $canEdit = $this->canEditAssessment($competencyAssessment);

        $competencyAssessment->load([
            'employee.user',
            'employee.department',
            'competency',
            'assessor',
            'assessmentCycle'
        ]);

        return Inertia::render('CompetencyAssessments/Evaluate', [
            'assessment' => $competencyAssessment,
            'canEdit' => $canEdit,
            'isReadOnly' => !$canEdit
        ]);
    }

    /**
     * Show the form for editing the specified assessment.
     */
    public function edit(CompetencyAssessment $competencyAssessment): Response
    {
        if (!$this->canEditAssessment($competencyAssessment)) {
            abort(403, 'You are not authorized to edit this assessment.');
        }

        $competencyAssessment->load([
            'employee.user',
            'competency.department',
            'assessor',
            'assessmentCycle'
        ]);

        return Inertia::render('CompetencyAssessments/Edit', [
            'assessment' => $competencyAssessment,
            'employees' => Employee::with('user')->select('id', 'user_id')->get(),
            'competencies' => Competency::where('is_active', true)->with('department')->get(),
            'assessmentCycles' => AssessmentCycle::select('id', 'name')->get(),
            'assessmentTypes' => ['self', 'manager', 'peer', '360'],
            'canEdit' => $this->canEditAssessment($competencyAssessment),
            'isViewingOthersAssessment' => $this->isViewingOthersAssessment($competencyAssessment)
        ]);
    }

    /**
     * Update the specified assessment.
     */
    public function update(Request $request, CompetencyAssessment $competencyAssessment)
    {
        if (!$this->canEditAssessment($competencyAssessment)) {
            return redirect()->back()
                ->with('error', 'You are not authorized to edit this assessment.');
        }

        // Manual validation with proper Inertia error handling
        $validator = \Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'assessment_type' => 'required|in:self,manager,peer,360',
            'assessment_cycle_id' => 'nullable|exists:assessment_cycles,id',
            'rating' => 'nullable|integer|min:1|max:5',
            'comments' => 'nullable|string|max:2000',
            'evidence_files' => 'nullable|array',
            'development_notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:draft,submitted'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator->errors())
                ->withInput($request->input());
        }

        try {
            $validated = $validator->validated();
            
            // Handle submission through service
            if (isset($validated['status']) && $validated['status'] === 'submitted') {
                // Remove status from validated data as service handles it
                unset($validated['status']);
                
                // Use service to submit assessment with proper validation
                $this->assessmentService->submitAssessment($competencyAssessment, $validated);
                
                return redirect()->route('competency-assessments.show', $competencyAssessment->id)
                    ->with('success', 'Assessment submitted successfully.');
            }
            
            // For draft updates, use regular model update
            $competencyAssessment->update($validated);

            // Redirect to show page with success message
            return redirect()->route('competency-assessments.show', $competencyAssessment->id)
                ->with('success', 'Assessment updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput($request->input());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update assessment: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified assessment from storage.
     */
    public function destroy(CompetencyAssessment $competencyAssessment): JsonResponse
    {
        if (!$this->canEditAssessment($competencyAssessment)) {
            return response()->json([
                'message' => 'You are not authorized to delete this assessment.'
            ], 403);
        }

        if ($competencyAssessment->isSubmitted() || $competencyAssessment->isApproved()) {
            return response()->json([
                'message' => 'Cannot delete submitted or approved assessments.'
            ], 422);
        }

        $competencyAssessment->delete();

        return response()->json([
            'message' => 'Assessment deleted successfully.'
        ]);
    }

    /**
     * Submit an assessment.
     */
    public function submit(Request $request, CompetencyAssessment $competencyAssessment)
    {
        if (!$this->canEditAssessment($competencyAssessment)) {
            return redirect()->back()
                ->with('error', 'You are not authorized to submit this assessment.');
        }

        try {
            $validated = $request->validate([
                'rating' => 'required|integer|between:1,5',
                'comments' => 'nullable|string|max:2000',
                'evidence_files' => 'nullable|array',
                'development_notes' => 'nullable|string|max:1000'
            ]);

            // Add conditional validation for comments based on rating
            if ($validated['rating'] <= 2 || $validated['rating'] >= 4) {
                $request->validate([
                    'comments' => 'required|string|max:2000'
                ]);
            }

            $this->assessmentService->submitAssessment($competencyAssessment, $validated);

            return redirect()->route('competency-assessments.show', $competencyAssessment->id)
                ->with('success', 'Assessment submitted successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput($request->input());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to submit assessment: ' . $e->getMessage())
                ->withInput($request->input());
        }
    }

    /**
     * Approve an assessment.
     */
    public function approve(Request $request, CompetencyAssessment $competencyAssessment)
    {
        if (!$this->canApproveAssessment($competencyAssessment)) {
            return redirect()->back()
                ->with('error', 'You are not authorized to approve this assessment.');
        }

        try {
            $validated = $request->validate([
                'approval_notes' => 'nullable|string|max:1000'
            ]);

            $this->assessmentService->approveAssessment(
                $competencyAssessment,
                Auth::user(),
                $validated['approval_notes'] ?? null
            );

            return redirect()->route('competency-assessments.show', $competencyAssessment->id)
                ->with('success', 'Assessment approved successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput($request->input());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to approve assessment: ' . $e->getMessage())
                ->withInput($request->input());
        }
    }

    /**
     * Reject an assessment.
     */
    public function reject(Request $request, CompetencyAssessment $competencyAssessment)
    {
        if (!$this->canApproveAssessment($competencyAssessment)) {
            return redirect()->back()
                ->with('error', 'You are not authorized to reject this assessment.');
        }

        try {
            $validated = $request->validate([
                'rejection_reason' => 'required|string|max:1000'
            ]);

            $this->assessmentService->rejectAssessment(
                $competencyAssessment,
                Auth::user(),
                $validated['rejection_reason']
            );

            return redirect()->route('competency-assessments.show', $competencyAssessment->id)
                ->with('success', 'Assessment rejected successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput($request->input());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to reject assessment: ' . $e->getMessage())
                ->withInput($request->input());
        }
    }

    /**
     * Get assessments for a specific employee.
     */
    public function byEmployee(Employee $employee, Request $request): Response
    {
        $employee->load(['user', 'department']);

        $query = CompetencyAssessment::with(['competency', 'assessor', 'assessmentCycle'])
            ->where('employee_id', $employee->id);

        // Apply filters
        if ($request->filled('assessment_type')) {
            $query->where('assessment_type', $request->assessment_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('competency_id')) {
            $query->where('competency_id', $request->competency_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $assessments = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get assessment statistics for this employee
        $stats = [
            'total' => CompetencyAssessment::where('employee_id', $employee->id)->count(),
            'completed' => CompetencyAssessment::where('employee_id', $employee->id)->whereIn('status', ['submitted', 'approved'])->count(),
            'pending' => CompetencyAssessment::where('employee_id', $employee->id)->where('status', 'draft')->count(),
            'average_rating' => CompetencyAssessment::where('employee_id', $employee->id)->whereNotNull('rating')->avg('rating')
        ];

        // Get development plans for this employee
        $developmentPlans = \App\Models\CompetencyDevelopmentPlan::with(['competency'])
            ->where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'competency' => $plan->competency ? [
                        'id' => $plan->competency->id,
                        'name' => $plan->competency->name,
                        'category' => $plan->competency->category
                    ] : null,
                    'current_rating' => $plan->current_rating,
                    'target_rating' => $plan->target_rating,
                    'target_date' => $plan->target_date?->format('Y-m-d'),
                    'status' => $plan->status,
                    'progress_percentage' => $plan->getProgressPercentage(),
                    'development_actions' => $plan->development_actions ?? [],
                    'completed_actions_count' => $plan->getCompletedActionsCount(),
                    'total_actions_count' => $plan->getTotalActionsCount(),
                    'days_remaining' => $plan->getDaysRemaining(),
                    'is_overdue' => $plan->isOverdue(),
                    'created_at' => $plan->created_at->format('Y-m-d H:i:s')
                ];
            });

        // Get feedback history (recent assessments with comments)
        $feedbackHistory = CompetencyAssessment::with(['competency', 'assessor'])
            ->where('employee_id', $employee->id)
            ->whereNotNull('comments')
            ->whereNotNull('rating')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'competency_name' => $assessment->competency->name ?? 'Unknown',
                    'assessor_name' => $assessment->assessor->name ?? 'Unknown',
                    'rating' => $assessment->rating,
                    'comments' => $assessment->comments,
                    'assessment_type' => $assessment->assessment_type,
                    'created_at' => $assessment->created_at->format('Y-m-d H:i:s')
                ];
            });

        // Get peer comparisons
        $peerComparisons = $this->getPeerComparisons($employee);

        return Inertia::render('CompetencyAssessments/EmployeeAssessments', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->user->name ?? 'Unknown',
                'position' => $employee->position,
                'department' => $employee->department ? [
                    'id' => $employee->department->id,
                    'name' => $employee->department->name
                ] : null
            ],
            'assessments' => $assessments,
            'stats' => $stats,
            'competencies' => Competency::where('is_active', true)->select('id', 'name', 'category')->orderBy('name')->get(),
            'assessmentTypes' => ['self', 'manager', 'peer', '360'],
            'statusOptions' => ['draft', 'submitted', 'approved', 'rejected'],
            'filters' => $request->only(['assessment_type', 'status', 'competency_id', 'date_from', 'date_to']),
            'developmentPlans' => $developmentPlans,
            'feedbackHistory' => $feedbackHistory,
            'peerComparisons' => $peerComparisons
        ]);
    }

    /**
     * Get peer comparison data for an employee.
     */
    private function getPeerComparisons(Employee $employee): array
    {
        // Get employee's average rating
        $employeeAverage = CompetencyAssessment::where('employee_id', $employee->id)
            ->whereNotNull('rating')
            ->avg('rating');

        if (!$employeeAverage || !$employee->department_id) {
            return [];
        }

        // Get department average (excluding this employee)
        $departmentAverage = CompetencyAssessment::whereHas('employee', function ($query) use ($employee) {
                $query->where('department_id', $employee->department_id)
                      ->where('id', '!=', $employee->id);
            })
            ->whereNotNull('rating')
            ->avg('rating');

        // Get competency-specific comparisons
        $competencyComparisons = DB::table('competency_assessments as ca1')
            ->join('employees as e1', 'ca1.employee_id', '=', 'e1.id')
            ->join('competencies as c', 'ca1.competency_id', '=', 'c.id')
            ->leftJoin('competency_assessments as ca2', function ($join) use ($employee) {
                $join->on('ca2.competency_id', '=', 'ca1.competency_id')
                     ->join('employees as e2', 'ca2.employee_id', '=', 'e2.id')
                     ->where('e2.department_id', '=', $employee->department_id)
                     ->where('ca2.employee_id', '!=', $employee->id)
                     ->whereNotNull('ca2.rating');
            })
            ->where('ca1.employee_id', $employee->id)
            ->whereNotNull('ca1.rating')
            ->where('e1.department_id', $employee->department_id)
            ->groupBy('ca1.competency_id', 'c.name')
            ->select([
                'ca1.competency_id',
                'c.name as competency_name',
                DB::raw('AVG(ca1.rating) as employee_rating'),
                DB::raw('AVG(ca2.rating) as peer_average')
            ])
            ->get()
            ->map(function ($item) {
                return [
                    'competency_id' => $item->competency_id,
                    'competency_name' => $item->competency_name,
                    'employee_rating' => round($item->employee_rating, 2),
                    'peer_average' => round($item->peer_average ?? 0, 2)
                ];
            })
            ->toArray();

        // Calculate department ranking
        $departmentEmployees = Employee::where('department_id', $employee->department_id)
            ->with(['competencyAssessments' => function ($query) {
                $query->whereNotNull('rating');
            }])
            ->get()
            ->map(function ($emp) {
                $avgRating = $emp->competencyAssessments->avg('rating');
                return [
                    'employee_id' => $emp->id,
                    'average_rating' => $avgRating ?? 0
                ];
            })
            ->sortByDesc('average_rating')
            ->values();

        $employeeRank = $departmentEmployees->search(function ($item) use ($employee) {
            return $item['employee_id'] === $employee->id;
        });

        return [
            'employee_average' => round($employeeAverage, 2),
            'department_average' => round($departmentAverage ?? 0, 2),
            'competency_comparisons' => $competencyComparisons,
            'department_rank' => $employeeRank !== false ? $employeeRank + 1 : null,
            'total_peers' => $departmentEmployees->count()
        ];
    }

    /**
     * Get assessments by the current user as assessor.
     */
    public function myAssessments(Request $request): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();
        
        $query = CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle'])
            ->where(function ($q) use ($user, $employee) {
                // Include assessments where user is the assessor
                $q->where('assessor_id', $user->id);
                
                // Include self-assessments where user is the employee being assessed
                if ($employee) {
                    $q->orWhere(function ($subQ) use ($employee) {
                        $subQ->where('employee_id', $employee->id)
                             ->where('assessment_type', 'self');
                    });
                }
            });

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assessment_cycle_id')) {
            $query->where('assessment_cycle_id', $request->assessment_cycle_id);
        }

        // Note: employee_id filter is not applied in myAssessments 
        // because users should see their own assessments regardless of filter
        // The RBA logic above already handles showing only relevant assessments

        $assessments = $query->orderBy('created_at', 'desc')->paginate(15);

        // Debug logging
        \Log::info('MyAssessments Debug', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'employee_id' => $employee?->id,
            'total_assessments' => $assessments->total(),
            'assessments_on_page' => $assessments->count(),
            'first_assessment_id' => $assessments->count() > 0 ? $assessments->first()->id : null,
            'request_filters' => $request->only(['status', 'assessment_cycle_id'])
        ]);

        // Get statistics
        $statsQuery = CompetencyAssessment::where(function ($q) use ($user, $employee) {
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

        return Inertia::render('CompetencyAssessments/MyAssessments', [
            'assessments' => $assessments,
            'stats' => $stats,
            'employees' => Employee::with('user')->select('id', 'user_id')->get(),
            'assessmentCycles' => AssessmentCycle::where('is_active', true)->select('id', 'name')->orderBy('name')->get(),
            'statusOptions' => ['draft', 'submitted', 'approved', 'rejected'],
            'filters' => $request->only(['status', 'assessment_cycle_id'])
        ]);
    }

    /**
     * Get pending assessments for the current user.
     */
    public function pending(Request $request): Response
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();
        
        $query = CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle'])
            ->where('status', 'draft');
            
        // Apply Role-Based Access Control
        if (!$user->hasRole(['admin', 'hr', 'Admin', 'HR'])) {
            // For non-admin/HR users, only show assessments they're involved in
            $query->where(function ($q) use ($user, $employee) {
                // Include assessments where user is the assessor
                $q->where('assessor_id', $user->id);
                
                // Include self-assessments where user is the employee being assessed
                if ($employee) {
                    $q->orWhere(function ($subQ) use ($employee) {
                        $subQ->where('employee_id', $employee->id)
                             ->where('assessment_type', 'self');
                    });
                }
            });
        }

        // Apply additional filters if needed
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('competency_id')) {
            $query->where('competency_id', $request->competency_id);
        }

        $pendingAssessments = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('CompetencyAssessments/Pending', [
            'assessments' => $pendingAssessments,
            'employees' => Employee::with('user')->select('id', 'user_id')->get(),
            'competencies' => Competency::where('is_active', true)->select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['employee_id', 'competency_id'])
        ]);
    }

    /**
     * Bulk create assessments.
     */
    public function bulkCreate(Request $request)
    {
        try {
            $validated = $request->validate([
                'employee_ids' => 'required|array',
                'employee_ids.*' => 'exists:employees,id',
                'competency_id' => 'required|exists:competencies,id',
                'assessment_cycle_id' => 'nullable|exists:assessment_cycles,id',
                'assessment_type' => 'required|in:self,manager,peer,360'
            ]);

            $cycle = $validated['assessment_cycle_id'] ? AssessmentCycle::find($validated['assessment_cycle_id']) : null;

            // Convert single competency to array for the service
            $competencyIds = [$validated['competency_id']];

            $assessments = $this->assessmentService->bulkCreateAssessments(
                $validated['employee_ids'],
                $competencyIds,
                Auth::user(),
                $cycle,
                $validated['assessment_type']
            );

            // Load relationships for the assessments
            $assessmentIds = $assessments->pluck('id');
            $loadedAssessments = CompetencyAssessment::with(['employee.user', 'competency'])
                ->whereIn('id', $assessmentIds)
                ->get();

            \Log::info('Bulk assessments created successfully', [
                'count' => $assessments->count(),
                'user_id' => Auth::id()
            ]);

            // For Inertia requests, redirect with success message
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('success', "Successfully created {$assessments->count()} assessments.");
            }

            return response()->json([
                'message' => 'Assessments created successfully.',
                'count' => $assessments->count(),
                'assessments' => $loadedAssessments
            ], 201);
        } catch (ValidationException $e) {
            \Log::error('Bulk assessment validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);
            
            // For Inertia requests, redirect back with errors
            if ($request->header('X-Inertia')) {
                return redirect()->back()->withErrors($e->errors());
            }
            
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Bulk assessment creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $validated ?? $request->all(),
                'user_id' => Auth::id()
            ]);
            
            // For Inertia requests, redirect back with error message
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Failed to create bulk assessments: ' . $e->getMessage());
            }
            
            return response()->json([
                'message' => 'Failed to create bulk assessments.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk submit assessments.
     */
    public function bulkSubmit(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'assessment_ids' => 'required|array',
                'assessment_ids.*' => 'exists:competency_assessments,id'
            ]);

            $assessments = CompetencyAssessment::whereIn('id', $validated['assessment_ids'])
                ->where('assessor_id', Auth::id())
                ->where('status', 'draft')
                ->get();

            $submitted = 0;
            $errors = [];

            foreach ($assessments as $assessment) {
                try {
                    // Validate that the assessment has required data
                    if (!$assessment->rating) {
                        $errors[] = "Assessment for {$assessment->employee->user->name} - {$assessment->competency->name} is missing rating.";
                        continue;
                    }

                    if ($assessment->requiresComments() && !$assessment->comments) {
                        $errors[] = "Assessment for {$assessment->employee->user->name} - {$assessment->competency->name} requires comments.";
                        continue;
                    }

                    $this->assessmentService->submitAssessment($assessment);
                    $submitted++;
                } catch (\Exception $e) {
                    $errors[] = "Failed to submit assessment for {$assessment->employee->user->name} - {$assessment->competency->name}: {$e->getMessage()}";
                }
            }

            return response()->json([
                'message' => "Successfully submitted {$submitted} assessments.",
                'submitted_count' => $submitted,
                'errors' => $errors
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to bulk submit assessments.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk approve assessments.
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'assessment_ids' => 'required|array',
                'assessment_ids.*' => 'exists:competency_assessments,id',
                'approval_notes' => 'nullable|string|max:1000'
            ]);

            $assessments = CompetencyAssessment::whereIn('id', $validated['assessment_ids'])
                ->where('status', 'submitted')
                ->get();

            $approved = 0;
            $errors = [];

            foreach ($assessments as $assessment) {
                try {
                    if ($this->canApproveAssessment($assessment)) {
                        $this->assessmentService->approveAssessment(
                            $assessment,
                            Auth::user(),
                            $validated['approval_notes'] ?? null
                        );
                        $approved++;
                    } else {
                        $errors[] = "Not authorized to approve assessment for {$assessment->employee->user->name} - {$assessment->competency->name}.";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Failed to approve assessment for {$assessment->employee->user->name} - {$assessment->competency->name}: {$e->getMessage()}";
                }
            }

            return response()->json([
                'message' => "Successfully approved {$approved} assessments.",
                'approved_count' => $approved,
                'errors' => $errors
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to bulk approve assessments.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export assessments to CSV.
     */
    public function export(Request $request): JsonResponse
    {
        $query = CompetencyAssessment::with(['employee.user', 'competency', 'assessor', 'assessmentCycle']);

        // Apply same filters as index
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('competency_id')) {
            $query->where('competency_id', $request->competency_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assessment_type')) {
            $query->where('assessment_type', $request->assessment_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $assessments = $query->get();

        $csvData = [];
        $csvData[] = [
            'Employee', 'Competency', 'Assessor', 'Assessment Type', 'Rating',
            'Status', 'Assessment Cycle', 'Submitted At', 'Comments'
        ];

        foreach ($assessments as $assessment) {
            $csvData[] = [
                $assessment->employee->user->name,
                $assessment->competency->name,
                $assessment->assessor->name,
                ucfirst($assessment->assessment_type),
                $assessment->rating ?? 'N/A',
                ucfirst($assessment->status),
                $assessment->assessmentCycle?->name ?? 'N/A',
                $assessment->submitted_at?->format('Y-m-d H:i:s') ?? 'N/A',
                $assessment->comments ?? ''
            ];
        }

        return response()->json([
            'data' => $csvData,
            'filename' => 'competency_assessments_' . now()->format('Y-m-d_H-i-s') . '.csv'
        ]);
    }

    /**
     * Validate assessment request data.
     */
    private function validateAssessmentRequest(Request $request, ?CompetencyAssessment $assessment = null): array
    {
        // Base rules for creating/updating assessments
        $rules = [
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'assessment_cycle_id' => 'nullable|exists:assessment_cycles,id',
            'assessment_type' => 'required|in:self,manager,peer,360',
            'rating' => 'nullable|integer|between:1,5',
            'comments' => 'nullable|string|max:2000',
            'evidence_files' => 'nullable|array',
            'development_notes' => 'nullable|string|max:1000'
        ];

        // For new assessments, add unique constraint and don't require rating
        if (!$assessment) {
            // Check for existing assessment manually to provide better error message
            $existingAssessment = CompetencyAssessment::where([
                'employee_id' => $request->employee_id,
                'competency_id' => $request->competency_id,
                'assessor_id' => Auth::id(),
                'assessment_cycle_id' => $request->assessment_cycle_id
            ])->first();
            
            if ($existingAssessment) {
                throw ValidationException::withMessages([
                    'employee_id' => ['An assessment for this employee and competency combination already exists.']
                ]);
            }
            // Remove status validation for creation - it will be set to 'draft'
            unset($rules['status']);
        } else {
            // For updates, allow status changes
            $rules['status'] = 'in:draft,submitted';
        }

        $validated = $request->validate($rules);

        // Add conditional validation for comments based on rating (only if rating is provided)
        if (isset($validated['rating']) && ($validated['rating'] <= 2 || $validated['rating'] >= 4)) {
            $request->validate([
                'comments' => 'required|string|max:2000'
            ]);
        }

        return $validated;
    }

    /**
     * Check if the current user can view the assessment.
     */
    public function canViewAssessment(CompetencyAssessment $assessment): bool
    {
        $user = Auth::user();
        
        // Admins and HR can view all assessments
        if ($user->hasRole(['Admin', 'HR'])) {
            return true;
        }
        
        // The assessor can always view their own assessments
        if ($assessment->assessor_id === $user->id) {
            return true;
        }
        
        // For self-assessments, the employee can view their own assessment
        if ($assessment->assessment_type === 'self') {
            $employee = $assessment->employee;
            if ($employee && $employee->user_id === $user->id) {
                return true;
            }
        }
        
        // Managers can view assessments of their department employees
        if ($user->hasRole('Manager') && $user->employee) {
            return $assessment->employee->department_id === $user->employee->department_id;
        }
        
        return false;
    }

    /**
     * Check if the current user is viewing someone else's assessment.
     */
    public function isViewingOthersAssessment(CompetencyAssessment $assessment): bool
    {
        $user = Auth::user();
        
        // For self-assessments, check if the viewer is not the employee
        if ($assessment->assessment_type === 'self') {
            return $assessment->employee_id !== $user->employee?->id;
        }
        
        // For other assessment types, check if the viewer is not the assessor
        return $assessment->assessor_id !== $user->id;
    }

    /**
     * Check if the current user can edit the assessment.
     */
    public function canEditAssessment(CompetencyAssessment $assessment): bool
    {
        $user = Auth::user();
        
        // Only draft assessments can be edited (regardless of role)
        if (!$assessment->isDraft()) {
            return false;
        }
        
        // Self-assessments can ONLY be edited by the employee themselves
        if ($assessment->assessment_type === 'self') {
            return $assessment->employee_id === $user->employee?->id;
        }
        
        // Manager assessments can be edited by:
        // 1. The assigned assessor (manager)
        // 2. Admins/HR (for administrative purposes)
        if ($assessment->assessment_type === 'manager') {
            return $assessment->assessor_id === $user->id || 
                   $user->hasRole(['Admin', 'HR']);
        }
        
        // Peer assessments can be edited by:
        // 1. The assigned assessor (peer)
        // 2. Admins/HR (for administrative purposes)
        if ($assessment->assessment_type === 'peer') {
            return $assessment->assessor_id === $user->id || 
                   $user->hasRole(['Admin', 'HR']);
        }
        
        // 360 assessments can be edited by:
        // 1. The assigned assessor
        // 2. Admins/HR (for administrative purposes)
        if ($assessment->assessment_type === '360') {
            return $assessment->assessor_id === $user->id || 
                   $user->hasRole(['Admin', 'HR']);
        }
        
        // Default: Use the same logic as view for other cases
        return $this->canViewAssessment($assessment);
    }

    /**
     * Check if the current user can approve the assessment.
     */
    private function canApproveAssessment(CompetencyAssessment $assessment): bool
    {
        // For now, allow managers and HR admins to approve
        // This should be enhanced with proper role-based permissions
        $user = Auth::user();
        
        // Don't allow self-approval
        if ($assessment->assessor_id === $user->id) {
            return false;
        }

        // Only submitted assessments can be approved
        if (!$assessment->isSubmitted()) {
            return false;
        }

        // Check if user has appropriate role/permissions
        // This is a simplified check - should be enhanced with proper role system
        return $user->hasRole(['HR Admin', 'Manager']) ?? false;
    }

    /**
     * Get related assessments for the same employee and competency.
     */
    private function getRelatedAssessments(CompetencyAssessment $assessment): array
    {
        return CompetencyAssessment::where('employee_id', $assessment->employee_id)
            ->where('competency_id', $assessment->competency_id)
            ->where('id', '!=', $assessment->id)
            ->with(['assessor', 'assessmentCycle'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->toArray();
    }

    /**
     * Get assessment statistics.
     */
    private function getAssessmentStats($user = null, $employee = null): array
    {
        // If no user provided, use current authenticated user (for backward compatibility)
        if (!$user) {
            $user = Auth::user();
            $employee = Employee::where('user_id', $user->id)->first();
        }
        
        // Base query for stats
        $baseQuery = CompetencyAssessment::query();
        
        // Apply same RBA logic as index method
        if (!$user->hasRole(['admin', 'hr', 'Admin', 'HR'])) {
            $baseQuery->where(function ($q) use ($user, $employee) {
                $q->where('assessor_id', $user->id);
                if ($employee) {
                    $q->orWhere(function ($subQ) use ($employee) {
                        $subQ->where('employee_id', $employee->id)
                             ->where('assessment_type', 'self');
                    });
                }
            });
        }
        
        return [
            'total_assessments' => (clone $baseQuery)->count(),
            'draft_assessments' => (clone $baseQuery)->where('status', 'draft')->count(),
            'submitted_assessments' => (clone $baseQuery)->where('status', 'submitted')->count(),
            'approved_assessments' => (clone $baseQuery)->where('status', 'approved')->count(),
            'rejected_assessments' => (clone $baseQuery)->where('status', 'rejected')->count(),
            'average_rating' => (clone $baseQuery)->where('status', 'approved')->avg('rating') ?? 0,
            'assessments_this_month' => (clone $baseQuery)->whereMonth('created_at', now()->month)->count(),
            'unique_employees_assessed' => (clone $baseQuery)->distinct('employee_id')->count()
        ];
    }
}