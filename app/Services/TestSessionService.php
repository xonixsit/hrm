<?php

namespace App\Services;

use App\Models\TestSession;
use App\Models\TestAssignment;
use App\Models\TestResponse;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TestSessionService
{
    /**
     * Start a new test session
     *
     * @param TestAssignment $assignment
     * @return TestSession
     * @throws Exception
     */
    public function startSession(TestAssignment $assignment): TestSession
    {
        // Check if assignment is available
        if (!$assignment->isAvailable()) {
            throw new Exception("This test is not currently available.");
        }

        // Check if assignment has expired
        if ($assignment->isExpired()) {
            throw new Exception("This test has expired.");
        }

        // Check if there are attempts remaining
        if (!$assignment->hasAttemptsRemaining()) {
            throw new Exception("No attempts remaining for this test.");
        }

        // Check for existing in-progress session
        $existingSession = $assignment->testSessions()
            ->where('status', 'in_progress')
            ->first();

        if ($existingSession) {
            // Check if time has expired
            if ($existingSession->isTimeExpired()) {
                $this->expireSession($existingSession);
                throw new Exception("Your previous session has expired. Please start a new attempt.");
            }

            return $existingSession;
        }

        // Create new session
        $session = $assignment->testSessions()->create([
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        // Update assignment status
        $assignment->update(['status' => 'in_progress']);

        Log::info("Test session started", [
            'session_id' => $session->id,
            'assignment_id' => $assignment->id,
            'test_id' => $assignment->skill_test_id,
        ]);

        return $session;
    }

    /**
     * Get session status and progress
     *
     * @param TestSession $session
     * @return array
     */
    public function getSessionStatus(TestSession $session): array
    {
        $skillTest = $session->testAssignment->skillTest;
        $questions = $skillTest->questions()->orderBy('order')->get();
        
        // Get existing answers
        $testResponse = $session->testResponse;
        $answers = $testResponse ? $testResponse->answers()->get()->keyBy('question_id') : collect();

        return [
            'session_id' => $session->id,
            'status' => $session->status,
            'started_at' => $session->started_at,
            'time_remaining' => $session->getTimeRemaining(),
            'is_time_expired' => $session->isTimeExpired(),
            'total_questions' => $questions->count(),
            'answered_questions' => $answers->count(),
            'progress_percentage' => $questions->count() > 0 
                ? round(($answers->count() / $questions->count()) * 100) 
                : 0,
        ];
    }

    /**
     * Save an answer without submitting
     *
     * @param TestSession $session
     * @param Question $question
     * @param array $answerData
     * @return Answer
     * @throws Exception
     */
    public function saveResponse(TestSession $session, Question $question, array $answerData): Answer
    {
        if (!$session->isInProgress()) {
            throw new Exception("Cannot save answer to a session that is not in progress.");
        }

        if ($session->isTimeExpired()) {
            $this->expireSession($session);
            throw new Exception("Time has expired for this test.");
        }

        return DB::transaction(function () use ($session, $question, $answerData) {
            // Get or create test response
            $testResponse = $session->testResponse()->firstOrCreate([
                'employee_id' => $session->testAssignment->employee_id,
                'skill_test_id' => $session->testAssignment->skill_test_id,
            ], [
                'review_status' => 'auto_scored',
            ]);

            // Delete existing answer for this question
            $testResponse->answers()->where('question_id', $question->id)->delete();

            // Create new answer
            $answer = $testResponse->answers()->create([
                'question_id' => $question->id,
                'answer_text' => $answerData['answer_text'] ?? null,
                'selected_option_id' => $answerData['selected_option_id'] ?? null,
            ]);

            // For MCQ, handle multiple selections
            if ($question->type === 'mcq' && isset($answerData['selected_option_ids'])) {
                // Store as JSON in answer_text for now
                $answer->update([
                    'answer_text' => json_encode($answerData['selected_option_ids']),
                ]);
            }

            Log::info("Answer saved", [
                'session_id' => $session->id,
                'question_id' => $question->id,
                'answer_id' => $answer->id,
            ]);

            return $answer;
        });
    }

    /**
     * Submit the test
     *
     * @param TestSession $session
     * @return TestResponse
     * @throws Exception
     */
    public function submitTest(TestSession $session): TestResponse
    {
        if (!$session->isInProgress()) {
            throw new Exception("Cannot submit a session that is not in progress.");
        }

        return DB::transaction(function () use ($session) {
            $timeSpent = $session->started_at->diffInSeconds(now());

            $session->update([
                'submitted_at' => now(),
                'time_spent' => $timeSpent,
                'status' => 'submitted',
            ]);

            // Get or create test response
            $testResponse = $session->testResponse()->firstOrCreate([
                'employee_id' => $session->testAssignment->employee_id,
                'skill_test_id' => $session->testAssignment->skill_test_id,
            ], [
                'review_status' => 'auto_scored',
            ]);

            // Auto-score answers
            $this->scoreAnswers($testResponse);

            // Update assignment status
            $assignment = $session->testAssignment;
            $completedSessions = $assignment->testSessions()
                ->where('status', 'submitted')
                ->count();

            $newStatus = $completedSessions >= $assignment->max_attempts ? 'completed' : 'in_progress';
            $assignment->update(['status' => $newStatus]);

            Log::info("Test submitted", [
                'session_id' => $session->id,
                'response_id' => $testResponse->id,
                'time_spent' => $timeSpent,
                'total_score' => $testResponse->fresh()->total_score,
            ]);

            return $testResponse->fresh();
        });
    }

    /**
     * Score all answers for a test response
     */
    protected function scoreAnswers(TestResponse $testResponse): void
    {
        $answers = $testResponse->answers()->with(['question.options'])->get();
        $hasTextQuestions = false;
        $totalScore = 0;

        foreach ($answers as $answer) {
            $question = $answer->question;

            if ($question->type === 'text') {
                // Text answers require manual review
                $hasTextQuestions = true;
                $answer->update(['is_correct' => null, 'score' => null]);
                continue;
            }

            if ($question->type === 'single_answer') {
                $isCorrect = $answer->selected_option_id
                    && $question->options->firstWhere('id', $answer->selected_option_id)?->is_correct === true;

                $score = $isCorrect ? (float) $question->points : 0;
                $answer->update(['is_correct' => $isCorrect, 'score' => $score]);
                $totalScore += $score;
            }

            if ($question->type === 'mcq') {
                $correctOptionIds = $question->options
                    ->where('is_correct', true)
                    ->pluck('id')
                    ->sort()
                    ->values()
                    ->toArray();

                $selectedIds = [];
                if ($answer->answer_text) {
                    $decoded = json_decode($answer->answer_text, true);
                    if (is_array($decoded)) {
                        $selectedIds = collect($decoded)->sort()->values()->toArray();
                    }
                } elseif ($answer->selected_option_id) {
                    $selectedIds = [$answer->selected_option_id];
                }

                $isCorrect = !empty($selectedIds) && $selectedIds === $correctOptionIds;
                $score = $isCorrect ? (float) $question->points : 0;
                $answer->update(['is_correct' => $isCorrect, 'score' => $score]);
                $totalScore += $score;
            }
        }

        // Calculate total possible points (excluding text questions for auto-score)
        $skillTest = $testResponse->skillTest;
        $totalPossible = $skillTest->questions()
            ->whereIn('type', ['mcq', 'single_answer'])
            ->sum('points');

        // If there are text questions, include their points in total possible
        $totalPossible = $skillTest->getTotalPoints();

        $percentage = $totalPossible > 0 ? round(($totalScore / $totalPossible) * 100, 2) : 0;
        $passed = $percentage >= $skillTest->passing_score;

        $testResponse->update([
            'submitted_at' => now(),
            'total_score' => $totalScore,
            'percentage_score' => $percentage,
            'passed' => $passed,
            'review_status' => $hasTextQuestions ? 'pending_review' : 'auto_scored',
        ]);
    }

    /**
     * Expire a session
     *
     * @param TestSession $session
     * @return void
     */
    protected function expireSession(TestSession $session): void
    {
        $session->update([
            'status' => 'expired',
            'submitted_at' => now(),
            'time_spent' => $session->started_at->diffInSeconds(now()),
        ]);

        Log::info("Test session expired", [
            'session_id' => $session->id,
        ]);
    }
}
