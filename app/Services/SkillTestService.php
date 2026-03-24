<?php

namespace App\Services;

use App\Models\SkillTest;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SkillTestService
{
    /**
     * Create a new skill test
     *
     * @param array $data
     * @param User $creator
     * @return SkillTest
     * @throws Exception
     */
    public function createTest(array $data, User $creator): SkillTest
    {
        // Validate unique test name
        $existingTest = SkillTest::where('name', $data['name'])
            ->whereNull('deleted_at')
            ->first();

        if ($existingTest) {
            throw new Exception("A skill test with the name '{$data['name']}' already exists.");
        }

        // Validate required fields
        if (empty($data['name'])) {
            throw new Exception("Test name is required.");
        }

        if (empty($data['description'])) {
            throw new Exception("Test description is required.");
        }

        // Set defaults
        $data['created_by'] = $creator->id;
        $data['status'] = $data['status'] ?? 'draft';
        $data['passing_score'] = $data['passing_score'] ?? 70;
        $data['max_attempts'] = $data['max_attempts'] ?? 1;
        $data['randomize_questions'] = $data['randomize_questions'] ?? false;
        $data['randomize_answers'] = $data['randomize_answers'] ?? false;
        $data['show_correct_answers'] = $data['show_correct_answers'] ?? false;
        $data['show_explanations'] = $data['show_explanations'] ?? false;
        $data['feedback_timing'] = $data['feedback_timing'] ?? 'immediate';

        // Validate passing score
        if ($data['passing_score'] < 0 || $data['passing_score'] > 100) {
            throw new Exception("Passing score must be between 0 and 100.");
        }

        // Validate max attempts
        if ($data['max_attempts'] < 1) {
            throw new Exception("Maximum attempts must be at least 1.");
        }

        // Validate time limit if provided
        if (isset($data['time_limit']) && $data['time_limit'] !== null && $data['time_limit'] < 1) {
            throw new Exception("Time limit must be at least 1 minute.");
        }

        try {
            $test = SkillTest::create($data);
            Log::info("Skill test created: {$test->id} - {$test->name}");
            return $test;
        } catch (Exception $e) {
            Log::error("Failed to create skill test: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing skill test
     *
     * @param SkillTest $test
     * @param array $data
     * @return SkillTest
     * @throws Exception
     */
    public function updateTest(SkillTest $test, array $data): SkillTest
    {
        // Validate unique test name if name is being changed
        if (isset($data['name']) && $data['name'] !== $test->name) {
            $existingTest = SkillTest::where('name', $data['name'])
                ->where('id', '!=', $test->id)
                ->whereNull('deleted_at')
                ->first();

            if ($existingTest) {
                throw new Exception("A skill test with the name '{$data['name']}' already exists.");
            }
        }

        // Validate passing score if provided
        if (isset($data['passing_score'])) {
            if ($data['passing_score'] < 0 || $data['passing_score'] > 100) {
                throw new Exception("Passing score must be between 0 and 100.");
            }
        }

        // Validate max attempts if provided
        if (isset($data['max_attempts'])) {
            if ($data['max_attempts'] < 1) {
                throw new Exception("Maximum attempts must be at least 1.");
            }
        }

        // Validate time limit if provided
        if (isset($data['time_limit']) && $data['time_limit'] !== null && $data['time_limit'] < 1) {
            throw new Exception("Time limit must be at least 1 minute.");
        }

        // Prevent status changes through update (use dedicated methods)
        if (isset($data['status'])) {
            unset($data['status']);
        }

        try {
            $test->update($data);
            Log::info("Skill test updated: {$test->id} - {$test->name}");
            return $test;
        } catch (Exception $e) {
            Log::error("Failed to update skill test {$test->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Publish a skill test
     *
     * @param SkillTest $test
     * @return SkillTest
     * @throws Exception
     */
    public function publishTest(SkillTest $test): SkillTest
    {
        // Validate test has at least one properly configured question
        $questions = $test->questions()->get();

        if ($questions->isEmpty()) {
            throw new Exception("Cannot publish test without at least one question.");
        }

        // Validate each question is properly configured
        foreach ($questions as $question) {
            if (empty($question->question_text)) {
                throw new Exception("Question {$question->id} is missing question text.");
            }

            if ($question->isMCQ() || $question->isSingleAnswer()) {
                $options = $question->options()->get();

                if ($options->count() < 2) {
                    throw new Exception("Question {$question->id} must have at least 2 options.");
                }

                $correctOptions = $options->where('is_correct', true);

                if ($correctOptions->isEmpty()) {
                    throw new Exception("Question {$question->id} must have at least one correct answer.");
                }

                if ($question->isSingleAnswer() && $correctOptions->count() > 1) {
                    throw new Exception("Single answer question {$question->id} must have exactly one correct answer.");
                }
            } elseif ($question->isText()) {
                // text_config is optional for text questions
            }
        }

        try {
            $test->update(['status' => 'published']);
            Log::info("Skill test published: {$test->id} - {$test->name}");
            return $test;
        } catch (Exception $e) {
            Log::error("Failed to publish skill test {$test->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Archive a skill test
     *
     * @param SkillTest $test
     * @return SkillTest
     * @throws Exception
     */
    public function archiveTest(SkillTest $test): SkillTest
    {
        try {
            $test->update(['status' => 'archived']);
            Log::info("Skill test archived: {$test->id} - {$test->name}");
            return $test;
        } catch (Exception $e) {
            Log::error("Failed to archive skill test {$test->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get tests filtered by status
     *
     * @param string $status
     * @return EloquentCollection
     */
    public function getTestsByStatus(string $status): EloquentCollection
    {
        $validStatuses = ['draft', 'published', 'archived'];

        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status: {$status}. Must be one of: " . implode(', ', $validStatuses));
        }

        return SkillTest::byStatus($status)
            ->with(['creator', 'questions'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get all tests with optional filtering
     *
     * @param array $filters
     * @return EloquentCollection
     */
    public function getAllTests(array $filters = []): EloquentCollection
    {
        $query = SkillTest::query();

        if (isset($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['difficulty_level'])) {
            $query->where('difficulty_level', $filters['difficulty_level']);
        }

        if (isset($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->with(['creator', 'questions'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Delete a skill test (soft delete)
     *
     * @param SkillTest $test
     * @return bool
     * @throws Exception
     */
    public function deleteTest(SkillTest $test): bool
    {
        try {
            $test->delete();
            Log::info("Skill test deleted: {$test->id} - {$test->name}");
            return true;
        } catch (Exception $e) {
            Log::error("Failed to delete skill test {$test->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get test statistics
     *
     * @param SkillTest $test
     * @return array
     */
    public function getTestStats(SkillTest $test): array
    {
        return [
            'id' => $test->id,
            'name' => $test->name,
            'status' => $test->status,
            'question_count' => $test->getQuestionCount(),
            'total_points' => $test->getTotalPoints(),
            'passing_score' => $test->passing_score,
            'time_limit' => $test->time_limit,
            'max_attempts' => $test->max_attempts,
            'assignment_count' => $test->testAssignments()->count(),
            'response_count' => $test->testResponses()->count(),
            'created_at' => $test->created_at,
            'updated_at' => $test->updated_at,
        ];
    }

    /**
     * Duplicate a skill test
     *
     * @param SkillTest $test
     * @param User $creator
     * @param string $newName
     * @return SkillTest
     * @throws Exception
     */
    public function duplicateTest(SkillTest $test, User $creator, string $newName): SkillTest
    {
        return DB::transaction(function () use ($test, $creator, $newName) {
            // Create new test with copied data
            $newTestData = $test->toArray();
            unset($newTestData['id']);
            unset($newTestData['created_at']);
            unset($newTestData['updated_at']);
            unset($newTestData['deleted_at']);

            $newTestData['name'] = $newName;
            $newTestData['status'] = 'draft';
            $newTestData['created_by'] = $creator->id;

            $newTest = SkillTest::create($newTestData);

            // Copy all questions and their configurations
            foreach ($test->questions as $question) {
                $newQuestionData = $question->toArray();
                unset($newQuestionData['id']);
                unset($newQuestionData['created_at']);
                unset($newQuestionData['updated_at']);
                $newQuestionData['skill_test_id'] = $newTest->id;

                $newQuestion = Question::create($newQuestionData);

                // Copy question options if MCQ or single answer
                if ($question->isMCQ() || $question->isSingleAnswer()) {
                    foreach ($question->options as $option) {
                        $newOptionData = $option->toArray();
                        unset($newOptionData['id']);
                        unset($newOptionData['created_at']);
                        unset($newOptionData['updated_at']);
                        $newOptionData['question_id'] = $newQuestion->id;

                        $newQuestion->options()->create($newOptionData);
                    }
                }

                // Copy text config if text question
                if ($question->isText() && $question->textConfig) {
                    $newConfigData = $question->textConfig->toArray();
                    unset($newConfigData['id']);
                    unset($newConfigData['created_at']);
                    unset($newConfigData['updated_at']);
                    $newConfigData['question_id'] = $newQuestion->id;

                    $newQuestion->textConfig()->create($newConfigData);
                }
            }

            Log::info("Skill test duplicated: {$test->id} -> {$newTest->id}");
            return $newTest;
        });
    }

    /**
     * Add a question to a skill test
     *
     * @param SkillTest $test
     * @param array $data
     * @return Question
     * @throws Exception
     */
    public function addQuestion(SkillTest $test, array $data): Question
    {
        if (!$test->isDraft()) {
            throw new Exception("Cannot add questions to a published or archived test.");
        }

        Log::info("Adding question with data:", $data);

        return DB::transaction(function () use ($test, $data) {
            // Set order to last
            $maxOrder = $test->questions()->max('order') ?? 0;
            $data['order'] = $maxOrder + 1;
            $data['skill_test_id'] = $test->id;

            $question = Question::create([
                'skill_test_id' => $data['skill_test_id'],
                'type' => $data['type'],
                'question_text' => $data['question_text'],
                'points' => $data['points'],
                'order' => $data['order'],
            ]);

            // Add options for MCQ or single answer
            if (in_array($data['type'], ['mcq', 'single_answer']) && isset($data['options'])) {
                foreach ($data['options'] as $optionData) {
                    if (!empty($optionData['option_text'])) {
                        $question->options()->create([
                            'option_text' => $optionData['option_text'],
                            'explanation' => $optionData['explanation'] ?? null,
                            'is_correct' => $optionData['is_correct'] ?? false,
                            'order' => $optionData['order'],
                        ]);
                    }
                }
            }

            // Add text config for text answer
            if ($data['type'] === 'text' && isset($data['text_config'])) {
                $question->textConfig()->create($data['text_config']);
            }

            Log::info("Question added to test {$test->id}: {$question->id}");
            return $question->load(['options', 'textConfig']);
        });
    }

    /**
     * Update a question
     *
     * @param SkillTest $test
     * @param Question $question
     * @param array $data
     * @return Question
     * @throws Exception
     */
    public function updateQuestion(SkillTest $test, Question $question, array $data): Question
    {
        if (!$test->isDraft()) {
            throw new Exception("Cannot update questions in a published or archived test.");
        }

        if ($question->skill_test_id !== $test->id) {
            throw new Exception("Question does not belong to this test.");
        }

        return DB::transaction(function () use ($question, $data) {
            $question->update([
                'question_text' => $data['question_text'],
                'points' => $data['points'],
            ]);

            // Update options for MCQ or single answer
            if (in_array($question->type, ['mcq', 'single_answer']) && isset($data['options'])) {
                // Delete existing options
                $question->options()->delete();

                // Create new options
                foreach ($data['options'] as $optionData) {
                    if (!empty($optionData['option_text'])) {
                        $question->options()->create([
                            'option_text' => $optionData['option_text'],
                            'explanation' => $optionData['explanation'] ?? null,
                            'is_correct' => $optionData['is_correct'] ?? false,
                            'order' => $optionData['order'],
                        ]);
                    }
                }
            }

            // Update text config for text answer
            if ($question->type === 'text' && isset($data['text_config'])) {
                if ($question->textConfig) {
                    $question->textConfig->update($data['text_config']);
                } else {
                    $question->textConfig()->create($data['text_config']);
                }
            }

            Log::info("Question updated: {$question->id}");
            return $question->load(['options', 'textConfig']);
        });
    }

    /**
     * Delete a question
     *
     * @param SkillTest $test
     * @param Question $question
     * @return bool
     * @throws Exception
     */
    public function deleteQuestion(SkillTest $test, Question $question): bool
    {
        if (!$test->isDraft()) {
            throw new Exception("Cannot delete questions from a published or archived test.");
        }

        if ($question->skill_test_id !== $test->id) {
            throw new Exception("Question does not belong to this test.");
        }

        try {
            $question->delete();
            Log::info("Question deleted: {$question->id}");
            return true;
        } catch (Exception $e) {
            Log::error("Failed to delete question {$question->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Assign test to employees
     *
     * @param SkillTest $test
     * @param array $employeeIds
     * @param array $config
     * @return Collection
     * @throws Exception
     */
    public function assignToEmployees(SkillTest $test, array $employeeIds, array $config): Collection
    {
        if (!$test->isPublished()) {
            throw new Exception("Cannot assign a test that is not published.");
        }

        if (empty($employeeIds)) {
            throw new Exception("At least one employee must be selected.");
        }

        $assignments = collect();

        return DB::transaction(function () use ($test, $employeeIds, $config, &$assignments) {
            foreach ($employeeIds as $employeeId) {
                $assignment = $test->testAssignments()->create([
                    'employee_id' => $employeeId,
                    'assigned_by' => auth()->id(),
                    'available_from' => $config['available_from'] ?? now(),
                    'available_until' => $config['available_until'] ?? null,
                    'max_attempts' => $config['max_attempts'] ?? $test->max_attempts,
                    'status' => 'pending',
                ]);

                $assignments->push($assignment);
                Log::info("Test {$test->id} assigned to employee {$employeeId}");
            }

            return $assignments;
        });
    }

    /**
     * Get assignments for a specific employee
     *
     * @param int $employeeId
     * @return EloquentCollection
     */
    public function getAssignmentsForEmployee(int $employeeId): EloquentCollection
    {
        return \App\Models\TestAssignment::where('employee_id', $employeeId)
            ->with(['skillTest', 'assignedBy', 'testSessions'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get assignments for a specific test
     *
     * @param SkillTest $test
     * @return EloquentCollection
     */
    public function getAssignmentsForTest(SkillTest $test): EloquentCollection
    {
        return $test->testAssignments()
            ->with(['employee.user', 'assignedBy', 'testSessions'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Update an assignment
     *
     * @param TestAssignment $assignment
     * @param array $data
     * @return TestAssignment
     * @throws Exception
     */
    public function updateAssignment(\App\Models\TestAssignment $assignment, array $data): \App\Models\TestAssignment
    {
        // Validate available_until is after available_from
        if (isset($data['available_until']) && isset($data['available_from'])) {
            $from = new \DateTime($data['available_from']);
            $until = new \DateTime($data['available_until']);
            
            if ($until <= $from) {
                throw new Exception("Deadline must be after the available from date.");
            }
        }

        // Validate max_attempts
        if (isset($data['max_attempts']) && $data['max_attempts'] < 1) {
            throw new Exception("Maximum attempts must be at least 1.");
        }

        try {
            $assignment->update($data);
            Log::info("Assignment updated", [
                'assignment_id' => $assignment->id,
                'test_id' => $assignment->skill_test_id,
                'employee_id' => $assignment->employee_id,
            ]);
            
            return $assignment;
        } catch (Exception $e) {
            Log::error("Failed to update assignment {$assignment->id}: " . $e->getMessage());
            throw $e;
        }
    }

}
