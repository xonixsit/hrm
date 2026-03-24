<?php

namespace App\Http\Controllers;

use App\Models\SkillTest;
use App\Models\TestResponse;
use App\Models\Answer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class SkillTestReviewController extends Controller
{
    /**
     * List all submitted test responses for admin review.
     */
    public function index(Request $request)
    {
        $this->authorize('review', SkillTest::class);

        $query = TestResponse::with([
            'employee.user',
            'skillTest',
            'testSession',
        ])->whereNotNull('submitted_at');

        if ($request->filled('test_id')) {
            $query->where('skill_test_id', $request->test_id);
        }

        if ($request->filled('review_status')) {
            $query->where('review_status', $request->review_status);
        }

        $responses = $query->latest('submitted_at')->paginate(20)->withQueryString();

        $tests = SkillTest::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('SkillTests/Review/Index', [
            'responses' => $responses->through(fn($r) => [
                'id' => $r->id,
                'employee' => [
                    'id' => $r->employee->id,
                    'name' => $r->employee->getFullName(),
                ],
                'test' => [
                    'id' => $r->skillTest->id,
                    'name' => $r->skillTest->name,
                    'passing_score' => $r->skillTest->passing_score,
                ],
                'total_score' => $r->total_score,
                'percentage_score' => $r->percentage_score,
                'passed' => $r->passed,
                'review_status' => $r->review_status,
                'submitted_at' => $r->submitted_at,
                'time_spent' => $r->testSession?->time_spent,
            ]),
            'tests' => $tests,
            'filters' => $request->only(['test_id', 'review_status']),
        ]);
    }

    /**
     * Show a single response for detailed review.
     */
    public function show(TestResponse $testResponse)
    {
        $this->authorize('review', SkillTest::class);

        $testResponse->load([
            'employee.user',
            'skillTest',
            'testSession',
            'answers.question.options',
            'answers.textReview.reviewer',
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
                'text_review' => $answer->textReview ? [
                    'id' => $answer->textReview->id,
                    'score' => $answer->textReview->score,
                    'comment' => $answer->textReview->comment,
                    'reviewer' => $answer->textReview->reviewer?->name,
                    'reviewed_at' => $answer->textReview->reviewed_at,
                ] : null,
            ];
        });

        return Inertia::render('SkillTests/Review/Show', [
            'response' => [
                'id' => $testResponse->id,
                'review_status' => $testResponse->review_status,
                'total_score' => $testResponse->total_score,
                'percentage_score' => $testResponse->percentage_score,
                'passed' => $testResponse->passed,
                'submitted_at' => $testResponse->submitted_at,
                'time_spent' => $testResponse->testSession?->time_spent,
            ],
            'employee' => [
                'id' => $testResponse->employee->id,
                'name' => $testResponse->employee->getFullName(),
            ],
            'test' => [
                'id' => $skillTest->id,
                'name' => $skillTest->name,
                'passing_score' => $skillTest->passing_score,
                'total_points' => $skillTest->getTotalPoints(),
            ],
            'answers' => $answers,
        ]);
    }

    /**
     * Save a review for a single answer (text answers get scored, others can be overridden).
     */
    public function reviewAnswer(Request $request, TestResponse $testResponse, Answer $answer)
    {
        $this->authorize('review', SkillTest::class);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'is_correct' => 'required|boolean',
            'comment' => 'nullable|string|max:1000',
        ]);

        try {
            $maxScore = $answer->question->points;
            $score = min((float) $validated['score'], (float) $maxScore);

            $answer->update([
                'is_correct' => $validated['is_correct'],
                'score' => $score,
            ]);

            // For text answers, save/update the review record
            if ($answer->question->type === 'text') {
                $answer->textReview()->updateOrCreate(
                    ['answer_id' => $answer->id],
                    [
                        'reviewed_by' => auth()->id(),
                        'score' => $score,
                        'comment' => $validated['comment'] ?? null,
                        'reviewed_at' => now(),
                    ]
                );
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to review answer: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Finalize the review — recalculate total score and mark as reviewed.
     */
    public function finalize(Request $request, TestResponse $testResponse)
    {
        $this->authorize('review', SkillTest::class);

        try {
            $testResponse->load('answers.question', 'skillTest');

            $totalScore = $testResponse->answers->sum('score');
            $totalPoints = $testResponse->skillTest->getTotalPoints();
            $percentage = $totalPoints > 0 ? round(($totalScore / $totalPoints) * 100, 2) : 0;
            $passed = $percentage >= $testResponse->skillTest->passing_score;

            $testResponse->update([
                'total_score' => $totalScore,
                'percentage_score' => $percentage,
                'passed' => $passed,
                'review_status' => 'reviewed',
            ]);

            return response()->json([
                'success' => true,
                'total_score' => $totalScore,
                'percentage_score' => $percentage,
                'passed' => $passed,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to finalize review: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
