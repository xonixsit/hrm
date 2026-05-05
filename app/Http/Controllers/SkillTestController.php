<?php

namespace App\Http\Controllers;

use App\Models\SkillTest;
use App\Models\Question;
use App\Models\TestSession;
use App\Services\SkillTestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class SkillTestController extends Controller
{
    protected SkillTestService $skillTestService;

    public function __construct(SkillTestService $skillTestService)
    {
        $this->skillTestService = $skillTestService;
    }

    /**
     * Display a listing of all skill tests with filtering
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SkillTest::class);

        $filters = [
            'status' => $request->query('status'),
            'category' => $request->query('category'),
            'difficulty_level' => $request->query('difficulty_level'),
            'search' => $request->query('search'),
        ];

        // Remove null filters
        $filters = array_filter($filters, fn($value) => $value !== null);

        try {
            $tests = $this->skillTestService->getAllTests($filters);

            return Inertia::render('SkillTests/Index', [
                'tests' => $tests->map(fn($test) => [
                    'id' => $test->id,
                    'name' => $test->name,
                    'description' => $test->description,
                    'category' => $test->category,
                    'difficulty_level' => $test->difficulty_level,
                    'status' => $test->status,
                    'passing_score' => $test->passing_score,
                    'time_limit' => $test->time_limit,
                    'max_attempts' => $test->max_attempts,
                    'question_count' => $test->getQuestionCount(),
                    'total_points' => $test->getTotalPoints(),
                    'created_by' => $test->creator?->name,
                    'created_at' => $test->created_at,
                    'updated_at' => $test->updated_at,
                ]),
                'filters' => $filters,
                'can' => [
                    'create' => $request->user()->hasAnyRole(['Admin', 'HR']),
                    'update' => $request->user()->hasAnyRole(['Admin', 'HR']),
                    'delete' => $request->user()->hasAnyRole(['Admin', 'HR']),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch skill tests: ' . $e->getMessage());
            return back()->with('error', 'Failed to fetch skill tests');
        }
    }

    /**
     * Show the form for creating a new skill test
     */
    public function create()
    {
        $this->authorize('create', SkillTest::class);

        return Inertia::render('SkillTests/Create');
    }

    /**
     * Store a newly created skill test in storage
     */
    public function store(Request $request)
    {
        $this->authorize('create', SkillTest::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:255',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'passing_score' => 'required|integer|min:0|max:100',
            'time_limit' => 'nullable|integer|min:1',
            'max_attempts' => 'required|integer|min:1',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'show_correct_answers' => 'boolean',
            'show_explanations' => 'boolean',
            'feedback_timing' => 'required|in:immediate,after_deadline,manual',
        ]);

        try {
            $test = $this->skillTestService->createTest($validated, auth()->user());

            return redirect()->route('skill-tests.edit', $test->id)
                ->with('success', 'Skill test created successfully. Add questions to continue.');
        } catch (\Exception $e) {
            Log::error('Failed to create skill test: ' . $e->getMessage());
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified skill test
     */
    public function edit(SkillTest $skillTest)
    {
        $this->authorize('view', $skillTest);

        $skillTest->load(['questions.options', 'questions.textConfig', 'creator']);

        return Inertia::render('SkillTests/Edit', [
            'test' => [
                'id' => $skillTest->id,
                'name' => $skillTest->name,
                'description' => $skillTest->description,
                'category' => $skillTest->category,
                'difficulty_level' => $skillTest->difficulty_level,
                'status' => $skillTest->status,
                'passing_score' => $skillTest->passing_score,
                'time_limit' => $skillTest->time_limit,
                'max_attempts' => $skillTest->max_attempts,
                'randomize_questions' => $skillTest->randomize_questions,
                'randomize_answers' => $skillTest->randomize_answers,
                'show_correct_answers' => $skillTest->show_correct_answers,
                'show_explanations' => $skillTest->show_explanations,
                'feedback_timing' => $skillTest->feedback_timing,
                'created_by' => $skillTest->creator?->name,
                'created_at' => $skillTest->created_at,
                'updated_at' => $skillTest->updated_at,
                'questions' => $skillTest->questions->map(fn($q) => [
                    'id' => $q->id,
                    'type' => $q->type,
                    'question_text' => $q->question_text,
                    'order' => $q->order,
                    'points' => $q->points,
                    'options' => $q->options->map(fn($o) => [
                        'id' => $o->id,
                        'option_text' => $o->option_text,
                        'explanation' => $o->explanation,
                        'is_correct' => $o->is_correct,
                        'order' => $o->order,
                    ]),
                    'text_config' => $q->textConfig ? [
                        'id' => $q->textConfig->id,
                        'min_characters' => $q->textConfig->min_characters,
                        'max_characters' => $q->textConfig->max_characters,
                        'expected_answer_guidelines' => $q->textConfig->expected_answer_guidelines,
                    ] : null,
                ]),
            ],
        ]);
    }

    /**
     * Update the specified skill test in storage
     */
    public function update(Request $request, SkillTest $skillTest)
    {
        $this->authorize('update', $skillTest);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:255',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'passing_score' => 'required|integer|min:0|max:100',
            'time_limit' => 'nullable|integer|min:1',
            'max_attempts' => 'required|integer|min:1',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'show_correct_answers' => 'boolean',
            'show_explanations' => 'boolean',
            'feedback_timing' => 'required|in:immediate,after_deadline,manual',
        ]);

        try {
            $this->skillTestService->updateTest($skillTest, $validated);

            return redirect()->route('skill-tests.edit', $skillTest->id)
                ->with('success', 'Skill test updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update skill test: ' . $e->getMessage());
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * Delete the specified skill test
     */
    public function destroy(SkillTest $skillTest)
    {
        $this->authorize('delete', $skillTest);

        try {
            $this->skillTestService->deleteTest($skillTest);

            return redirect()->route('skill-tests.index')
                ->with('success', 'Skill test deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete skill test: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Publish the specified skill test
     */
    public function publish(Request $request, SkillTest $skillTest)
    {
        $this->authorize('publish', $skillTest);

        try {
            $this->skillTestService->publishTest($skillTest);

            return redirect()->route('skill-tests.edit', $skillTest->id)
                ->with('success', 'Skill test published successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to publish skill test: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Archive the specified skill test
     */
    public function archive(Request $request, SkillTest $skillTest)
    {
        $this->authorize('archive', $skillTest);

        try {
            $this->skillTestService->archiveTest($skillTest);

            return redirect()->route('skill-tests.index')
                ->with('success', 'Skill test archived successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to archive skill test: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Store a new question for the skill test
     */
    public function storeQuestion(Request $request, SkillTest $skillTest)
    {
        $this->authorize('update', $skillTest);

        $validated = $request->validate([
            'type' => 'required|in:mcq,single_answer,text',
            'question_text' => 'required|string',
            'points' => 'required|integer|min:1',
            'options' => 'array|nullable',
            'options.*.option_text' => 'string|nullable',
            'options.*.explanation' => 'nullable|string',
            'options.*.is_correct' => 'boolean',
            'options.*.order' => 'integer|nullable',
            'text_config' => 'array|nullable',
            'text_config.min_characters' => 'nullable|integer|min:0',
            'text_config.max_characters' => 'nullable|integer|min:1',
            'text_config.expected_answer_guidelines' => 'nullable|string',
        ]);

        try {
            $question = $this->skillTestService->addQuestion($skillTest, $validated);

            return back()->with('success', 'Question added successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to add question: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update an existing question
     */
    public function updateQuestion(Request $request, SkillTest $skillTest, Question $question)
    {
        $this->authorize('update', $skillTest);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'points' => 'required|integer|min:1',
            'options' => 'sometimes|array|min:2',
            'options.*.option_text' => 'required_with:options|string',
            'options.*.explanation' => 'nullable|string',
            'options.*.is_correct' => 'boolean',
            'options.*.order' => 'required_with:options|integer',
            'text_config' => 'sometimes|array',
            'text_config.min_characters' => 'nullable|integer|min:0',
            'text_config.max_characters' => 'nullable|integer|min:1',
            'text_config.expected_answer_guidelines' => 'nullable|string',
        ]);

        try {
            $this->skillTestService->updateQuestion($skillTest, $question, $validated);

            return back()->with('success', 'Question updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update question: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Delete a question
     */
    public function destroyQuestion(SkillTest $skillTest, Question $question)
    {
        $this->authorize('update', $skillTest);

        try {
            $this->skillTestService->deleteQuestion($skillTest, $question);

            return back()->with('success', 'Question deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete question: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show assignment form
     */
    public function showAssignments(SkillTest $skillTest)
    {
        $this->authorize('assign', $skillTest);

        $assignments = $this->skillTestService->getAssignmentsForTest($skillTest);

        return response()->json([
            'assignments' => $assignments->map(fn($assignment) => [
                'id' => $assignment->id,
                'employee' => [
                    'id' => $assignment->employee->id,
                    'name' => $assignment->employee->getFullName(),
                    'email' => $assignment->employee->user?->email,
                ],
                'assigned_by' => $assignment->assignedBy->name,
                'available_from' => $assignment->available_from,
                'available_until' => $assignment->available_until,
                'max_attempts' => $assignment->max_attempts,
                'status' => $assignment->status,
                'attempts_remaining' => $assignment->getAttemptsRemaining(),
                'created_at' => $assignment->created_at,
            ]),
        ]);
    }

    /**
     * Assign test to employees
     */
    public function assign(Request $request, SkillTest $skillTest)
    {
        $this->authorize('assign', $skillTest);

        $validated = $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'required|exists:employees,id',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after:available_from',
            'max_attempts' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        try {
            $config = [
                'available_from' => $validated['available_from'] ?? now(),
                'available_until' => $validated['available_until'] ?? null,
                'max_attempts' => $validated['max_attempts'] ?? $skillTest->max_attempts,
            ];

            $assignments = $this->skillTestService->assignToEmployees(
                $skillTest,
                $validated['employee_ids'],
                $config
            );

            // Send notifications to assigned employees
            foreach ($assignments as $assignment) {
                $assignment->employee->notify(
                    new \App\Notifications\TestAssignedNotification($assignment, $validated['notes'] ?? null)
                );
            }

            return back()->with('success', "Test assigned to {$assignments->count()} employee(s) successfully.");
        } catch (\Exception $e) {
            Log::error('Failed to assign test: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update an assignment
     */
    public function updateAssignment(Request $request, \App\Models\TestAssignment $testAssignment)
    {
        $this->authorize('assign', $testAssignment->skillTest);

        $validated = $request->validate([
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after:available_from',
            'max_attempts' => 'nullable|integer|min:1',
        ]);

        try {
            $this->skillTestService->updateAssignment($testAssignment, $validated);

            return response()->json(['success' => true, 'message' => 'Assignment updated successfully.']);
        } catch (\Exception $e) {
            Log::error('Failed to update assignment: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Show employee's assigned tests
     */
    public function myTests(Request $request)
    {
        try {
            \Log::info('MyTests: Starting', ['user_id' => $request->user()->id]);
            
            $user = $request->user();
            $employee = $user->employee;

            if (!$employee) {
                \Log::warning('MyTests: No employee record found', ['user_id' => $user->id]);
                return Inertia::render('SkillTests/MyTests', ['assignments' => []]);
            }

            \Log::info('MyTests: Employee found', ['employee_id' => $employee->id]);
            
            // Check if service exists and has method
            if (!method_exists($this->skillTestService, 'getAssignmentsForEmployee')) {
                \Log::error('MyTests: Method getAssignmentsForEmployee does not exist on SkillTestService', [
                    'service_class' => get_class($this->skillTestService),
                    'available_methods' => get_class_methods($this->skillTestService)
                ]);
                throw new \Exception('SkillTestService is missing getAssignmentsForEmployee method');
            }

            \Log::info('MyTests: Calling getAssignmentsForEmployee', ['employee_id' => $employee->id]);
            $assignments = $this->skillTestService->getAssignmentsForEmployee($employee->id);
            \Log::info('MyTests: Got assignments', ['count' => $assignments->count()]);
            
            $assignedTestIds = $assignments->pluck('skill_test_id')->toArray();

            // All published tests not explicitly assigned — shown as virtual/open entries
            $unassignedTests = SkillTest::where('status', 'published')
                ->whereNotIn('id', $assignedTestIds)
                ->get();

            $formatReal = function ($assignment) use ($employee) {
                $result = \App\Models\TestResponse::where('employee_id', $employee->id)
                    ->where('skill_test_id', $assignment->skill_test_id)
                    ->whereNotNull('submitted_at')
                    ->latest('submitted_at')
                    ->first();

                return [
                    'id' => $assignment->id,
                    'is_virtual' => false,
                    'test' => [
                        'id' => $assignment->skillTest->id,
                        'name' => $assignment->skillTest->name,
                        'description' => $assignment->skillTest->description,
                        'category' => $assignment->skillTest->category,
                        'difficulty_level' => $assignment->skillTest->difficulty_level,
                        'passing_score' => $assignment->skillTest->passing_score,
                        'time_limit' => $assignment->skillTest->time_limit,
                        'question_count' => $assignment->skillTest->getQuestionCount(),
                    ],
                    'available_from' => $assignment->available_from,
                    'available_until' => $assignment->available_until,
                    'max_attempts' => $assignment->max_attempts,
                    'attempts_remaining' => $assignment->getAttemptsRemaining(),
                    'status' => $assignment->status,
                    'is_available' => $assignment->isAvailable(),
                    'is_expired' => $assignment->isExpired(),
                    'result_id' => $result?->id,
                    'review_status' => $result?->review_status,
                ];
            };

            $formatVirtual = function ($test) {
                return [
                    'id' => null,
                    'is_virtual' => true,
                    'test' => [
                        'id' => $test->id,
                        'name' => $test->name,
                        'description' => $test->description,
                        'category' => $test->category,
                        'difficulty_level' => $test->difficulty_level,
                        'passing_score' => $test->passing_score,
                        'time_limit' => $test->time_limit,
                        'question_count' => $test->getQuestionCount(),
                    ],
                    'available_from' => null,
                    'available_until' => null,
                    'max_attempts' => $test->max_attempts,
                    'attempts_remaining' => $test->max_attempts,
                    'status' => 'pending',
                    'is_available' => true,
                    'is_expired' => false,
                    'result_id' => null,
                    'review_status' => null,
                ];
            };

            $allAssignments = $assignments->map($formatReal)
                ->concat($unassignedTests->map($formatVirtual));

            \Log::info('MyTests: Returning assignments', ['total_count' => $allAssignments->count()]);

            return Inertia::render('SkillTests/MyTests', [
                'assignments' => $allAssignments,
            ]);
        } catch (\Exception $e) {
            \Log::error('MyTests: Exception occurred', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('SkillTests/MyTests', [
                'assignments' => [],
                'error' => 'Failed to load skill tests: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show test start screen
     */
    public function take(Request $request, SkillTest $skillTest)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return redirect()->route('skill-tests.my-tests')
                ->with('error', 'Employee record not found.');
        }

        // Find assignment - prioritize non-expired, available assignments
        $assignment = $skillTest->testAssignments()
            ->where('employee_id', $employee->id)
            ->where(function ($query) {
                // Get assignments that are not expired
                $query->whereNull('available_until')
                      ->orWhere('available_until', '>=', now());
            })
            ->where(function ($query) {
                // Get assignments that are available now
                $query->whereNull('available_from')
                      ->orWhere('available_from', '<=', now());
            })
            ->orderBy('available_until', 'desc') // Prioritize assignments with later deadlines
            ->first();

        // If no active assignment found, try to find any assignment (even expired)
        if (!$assignment) {
            $assignment = $skillTest->testAssignments()
                ->where('employee_id', $employee->id)
                ->orderBy('created_at', 'desc')
                ->first();
        }

        // If no assignment found, auto-create one (open/published test default access)
        if (!$assignment) {
            if (!$skillTest->isPublished()) {
                return redirect()->route('skill-tests.my-tests')
                    ->with('error', 'This test is not available.');
            }
            $assignment = $skillTest->testAssignments()->create([
                'employee_id' => $employee->id,
                'assigned_by' => $employee->user_id,
                'available_from' => now(),
                'available_until' => null,
                'max_attempts' => $skillTest->max_attempts,
                'status' => 'pending',
            ]);
        }

        // Check for existing in-progress session
        $existingSession = $assignment->testSessions()
            ->where('status', 'in_progress')
            ->first();

        if ($existingSession) {
            return redirect()->route('skill-tests.test-session', $existingSession->id);
        }

        return Inertia::render('SkillTests/TakeTest', [
            'test' => [
                'id' => $skillTest->id,
                'name' => $skillTest->name,
                'description' => $skillTest->description,
                'category' => $skillTest->category,
                'difficulty_level' => $skillTest->difficulty_level,
                'passing_score' => $skillTest->passing_score,
                'time_limit' => $skillTest->time_limit,
                'max_attempts' => $skillTest->max_attempts,
                'question_count' => $skillTest->getQuestionCount(),
                'total_points' => $skillTest->getTotalPoints(),
            ],
            'assignment' => [
                'id' => $assignment->id,
                'available_until' => $assignment->available_until,
                'attempts_remaining' => $assignment->getAttemptsRemaining(),
                'is_available' => $assignment->isAvailable(),
                'is_expired' => $assignment->isExpired(),
            ],
        ]);
    }

    /**
     * Start test session
     */
    public function startSession(Request $request, SkillTest $skillTest)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return back()->with('error', 'Employee record not found.');
        }

        // Find assignment - prioritize non-expired, available assignments
        $assignment = $skillTest->testAssignments()
            ->where('employee_id', $employee->id)
            ->where(function ($query) {
                // Get assignments that are not expired
                $query->whereNull('available_until')
                      ->orWhere('available_until', '>=', now());
            })
            ->where(function ($query) {
                // Get assignments that are available now
                $query->whereNull('available_from')
                      ->orWhere('available_from', '<=', now());
            })
            ->orderBy('available_until', 'desc') // Prioritize assignments with later deadlines
            ->first();

        // If no active assignment found, try to find any assignment (even expired)
        if (!$assignment) {
            $assignment = $skillTest->testAssignments()
                ->where('employee_id', $employee->id)
                ->orderBy('created_at', 'desc')
                ->first();
        }

        // If no assignment found, auto-create one (open/published test default access)
        if (!$assignment) {
            if (!$skillTest->isPublished()) {
                return back()->with('error', 'This test is not available.');
            }
            $assignment = $skillTest->testAssignments()->create([
                'employee_id' => $employee->id,
                'assigned_by' => $employee->user_id,
                'available_from' => now(),
                'available_until' => null,
                'max_attempts' => $skillTest->max_attempts,
                'status' => 'pending',
            ]);
        }

        try {
            $sessionService = app(\App\Services\TestSessionService::class);
            $session = $sessionService->startSession($assignment);

            return redirect()->route('skill-tests.test-session', $session->id);
        } catch (\Exception $e) {
            Log::error('Failed to start test session: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show test session (test taking interface)
     */
    public function testSession(Request $request, TestSession $testSession)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee || $testSession->testAssignment->employee_id !== $employee->id) {
            return redirect()->route('skill-tests.my-tests')
                ->with('error', 'Unauthorized access.');
        }

        if (!$testSession->isInProgress()) {
            return redirect()->route('skill-tests.my-tests')
                ->with('error', 'This test session is no longer active.');
        }

        $skillTest = $testSession->testAssignment->skillTest;
        $questions = $skillTest->questions()->with(['options', 'textConfig'])->orderBy('order')->get();
        
        // Get existing answers
        $testResponse = $testSession->testResponse;
        $answers = $testResponse ? $testResponse->answers()->get() : collect();
        
        // Format answers for frontend
        $formattedAnswers = [];
        foreach ($answers as $answer) {
            $question = $questions->firstWhere('id', $answer->question_id);
            
            if ($question && $question->type === 'mcq') {
                // Parse JSON for multiple choice
                $selectedOptions = json_decode($answer->answer_text, true) ?: [];
                $formattedAnswers[$answer->question_id] = [
                    'selected_options' => $selectedOptions,
                    'answer_text' => null,
                ];
            } elseif ($question && $question->type === 'single_answer') {
                $formattedAnswers[$answer->question_id] = [
                    'selected_options' => $answer->selected_option_id ? [$answer->selected_option_id] : [],
                    'answer_text' => null,
                ];
            } else {
                $formattedAnswers[$answer->question_id] = [
                    'selected_options' => [],
                    'answer_text' => $answer->answer_text,
                ];
            }
        }

        $sessionService = app(\App\Services\TestSessionService::class);
        $sessionStatus = $sessionService->getSessionStatus($testSession);

        return Inertia::render('SkillTests/TestSession', [
            'session' => [
                'id' => $testSession->id,
                'status' => $testSession->status,
                'started_at' => $testSession->started_at,
                'time_remaining' => $sessionStatus['time_remaining'],
                'is_time_expired' => $sessionStatus['is_time_expired'],
            ],
            'test' => [
                'id' => $skillTest->id,
                'name' => $skillTest->name,
                'time_limit' => $skillTest->time_limit,
                'passing_score' => $skillTest->passing_score,
            ],
            'questions' => $questions->map(fn($q) => [
                'id' => $q->id,
                'type' => $q->type,
                'question_text' => $q->question_text,
                'points' => $q->points,
                'order' => $q->order,
                'options' => $q->options->map(fn($o) => [
                    'id' => $o->id,
                    'option_text' => $o->option_text,
                    'order' => $o->order,
                ]),
                'text_config' => $q->textConfig ? [
                    'min_characters' => $q->textConfig->min_characters,
                    'max_characters' => $q->textConfig->max_characters,
                ] : null,
            ]),
            'answers' => $formattedAnswers,
            'progress' => $sessionStatus,
        ]);
    }

    /**
     * Save answer
     */
    public function saveAnswer(Request $request, TestSession $testSession, Question $question)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee || $testSession->testAssignment->employee_id !== $employee->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'answer_text' => 'nullable|string',
            'selected_option_id' => 'nullable|exists:question_options,id',
            'selected_option_ids' => 'nullable|array',
            'selected_option_ids.*' => 'exists:question_options,id',
        ]);

        try {
            $sessionService = app(\App\Services\TestSessionService::class);
            $answer = $sessionService->saveResponse($testSession, $question, $validated);

            return response()->json([
                'success' => true,
                'answer' => $answer,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save answer: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Show employee's own result for a submitted test response
     */
    public function myResult(Request $request, \App\Models\TestResponse $testResponse)
    {
        $employee = $request->user()->employee;

        if (!$employee || $testResponse->employee_id !== $employee->id) {
            return redirect()->route('skill-tests.my-tests')->with('error', 'Unauthorized access.');
        }

        // Only show if reviewed, auto_scored, or pending_review
        if (!in_array($testResponse->review_status, ['reviewed', 'auto_scored', 'pending_review'])) {
            return redirect()->route('skill-tests.my-tests')->with('error', 'Results are not available yet.');
        }

        $testResponse->load([
            'skillTest',
            'answers.question.options',
            'answers.textReview',
        ]);

        $skillTest = $testResponse->skillTest;

        $answers = $testResponse->answers->map(function ($answer) {
            $question = $answer->question;
            $selectedOptionIds = [];

            if ($question->type === 'mcq') {
                $selectedOptionIds = json_decode($answer->answer_text, true) ?: [];
            } elseif ($question->type === 'single_answer') {
                $selectedOptionIds = $answer->selected_option_id ? [$answer->selected_option_id] : [];
            }

            return [
                'id' => $answer->id,
                'question' => [
                    'id' => $question->id,
                    'type' => $question->type,
                    'question_text' => $question->question_text,
                    'points' => $question->points,
                    'options' => $question->options->map(fn($o) => [
                        'id' => $o->id,
                        'option_text' => $o->option_text,
                        'is_correct' => $o->is_correct,
                    ]),
                ],
                'answer_text' => $question->type === 'text' ? $answer->answer_text : null,
                'selected_option_ids' => $selectedOptionIds,
                'is_correct' => $answer->is_correct,
                'score' => $answer->score,
                'reviewer_comment' => $answer->textReview?->comment,
            ];
        });

        return Inertia::render('SkillTests/MyResult', [
            'response' => [
                'id' => $testResponse->id,
                'review_status' => $testResponse->review_status,
                'total_score' => $testResponse->total_score,
                'percentage_score' => $testResponse->percentage_score,
                'passed' => $testResponse->passed,
                'submitted_at' => $testResponse->submitted_at,
            ],
            'test' => [
                'id' => $skillTest->id,
                'name' => $skillTest->name,
                'passing_score' => $skillTest->passing_score,
                'total_points' => $skillTest->getTotalPoints(),
                'show_correct_answers' => $skillTest->show_correct_answers,
            ],
            'answers' => $answers,
        ]);
    }

    /**
     * Submit test
     */
    public function submitSession(Request $request, TestSession $testSession)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee || $testSession->testAssignment->employee_id !== $employee->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $sessionService = app(\App\Services\TestSessionService::class);
            $testResponse = $sessionService->submitTest($testSession);

            return response()->json([
                'success' => true,
                'response_id' => $testResponse->id,
                'redirect' => route('skill-tests.my-tests'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to submit test: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

}
