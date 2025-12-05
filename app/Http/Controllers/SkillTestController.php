<?php

namespace App\Http\Controllers;

use App\Models\SkillTest;
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
        $this->authorize('update', $skillTest);

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
}
