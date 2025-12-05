<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\TextQuestionConfig;
use App\Models\SkillTest;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class QuestionService
{
    /**
     * Add a new question to a skill test
     *
     * @param SkillTest $test
     * @param array $data
     * @return Question
     * @throws Exception
     */
    public function addQuestion(SkillTest $test, array $data): Question
    {
        // Validate question type
        $validTypes = ['mcq', 'text', 'single_answer'];
        if (!isset($data['type']) || !in_array($data['type'], $validTypes)) {
            throw new Exception("Invalid question type. Must be one of: " . implode(', ', $validTypes));
        }

        // Validate question text
        if (empty($data['question_text'])) {
            throw new Exception("Question text is required.");
        }

        // Validate points
        if (!isset($data['points']) || $data['points'] < 0) {
            throw new Exception("Points must be a non-negative number.");
        }

        // Type-specific validation
        $errors = $this->validateQuestionConfiguration($data);
        if (!empty($errors)) {
            throw new Exception($errors[0]);
        }

        return DB::transaction(function () use ($test, $data) {
            // Get the next order number
            $nextOrder = $test->questions()->max('order') + 1;

            // Create the question
            $questionData = [
                'skill_test_id' => $test->id,
                'type' => $data['type'],
                'question_text' => $data['question_text'],
                'points' => $data['points'],
                'order' => $nextOrder,
            ];

            $question = Question::create($questionData);

            // Handle type-specific data
            if ($data['type'] === 'mcq' || $data['type'] === 'single_answer') {
                $this->addQuestionOptions($question, $data);
            } elseif ($data['type'] === 'text') {
                $this->addTextQuestionConfig($question, $data);
            }

            Log::info("Question added to test {$test->id}: {$question->id}");
            return $question->load(['options', 'textConfig']);
        });
    }

    /**
     * Update an existing question
     *
     * @param Question $question
     * @param array $data
     * @return Question
     * @throws Exception
     */
    public function updateQuestion(Question $question, array $data): Question
    {
        // Validate question text if provided
        if (isset($data['question_text']) && empty($data['question_text'])) {
            throw new Exception("Question text cannot be empty.");
        }

        // Validate points if provided
        if (isset($data['points']) && $data['points'] < 0) {
            throw new Exception("Points must be a non-negative number.");
        }

        // Prevent type changes
        if (isset($data['type']) && $data['type'] !== $question->type) {
            throw new Exception("Cannot change question type after creation.");
        }

        return DB::transaction(function () use ($question, $data) {
            // Update basic question data
            $updateData = [];
            if (isset($data['question_text'])) {
                $updateData['question_text'] = $data['question_text'];
            }
            if (isset($data['points'])) {
                $updateData['points'] = $data['points'];
            }

            if (!empty($updateData)) {
                $question->update($updateData);
            }

            // Handle type-specific updates
            if ($question->isMCQ() || $question->isSingleAnswer()) {
                if (isset($data['options'])) {
                    $this->updateQuestionOptions($question, $data['options']);
                }
            } elseif ($question->isText()) {
                if (isset($data['text_config'])) {
                    $this->updateTextQuestionConfig($question, $data['text_config']);
                }
            }

            Log::info("Question updated: {$question->id}");
            return $question->load(['options', 'textConfig']);
        });
    }

    /**
     * Delete a question from a skill test
     *
     * @param Question $question
     * @return bool
     * @throws Exception
     */
    public function deleteQuestion(Question $question): bool
    {
        return DB::transaction(function () use ($question) {
            $testId = $question->skill_test_id;

            // Delete related data
            $question->options()->delete();
            $question->textConfig()->delete();
            $question->answers()->delete();

            // Delete the question
            $question->delete();

            // Reorder remaining questions
            $this->reorderQuestionsAfterDelete($testId);

            Log::info("Question deleted: {$question->id}");
            return true;
        });
    }

    /**
     * Reorder questions for drag-and-drop functionality
     *
     * @param SkillTest $test
     * @param array|null $questionIds
     * @return bool
     * @throws Exception
     */
    public function reorderQuestions(SkillTest $test, ?array $questionIds = null): bool
    {
        // If no IDs provided, reorder sequentially
        if ($questionIds === null) {
            return DB::transaction(function () use ($test) {
                $questions = $test->questions()->orderBy('order')->get();
                foreach ($questions as $index => $question) {
                    $question->update(['order' => $index + 1]);
                }
                Log::info("Questions reordered sequentially for test {$test->id}");
                return true;
            });
        }

        // Validate all question IDs belong to this test
        $existingQuestions = $test->questions()->pluck('id')->toArray();
        $providedIds = array_values($questionIds);

        if (count($providedIds) !== count($existingQuestions) || 
            count(array_diff($providedIds, $existingQuestions)) > 0) {
            throw new Exception("Invalid question IDs provided for reordering. All questions do not belong to this test.");
        }

        return DB::transaction(function () use ($questionIds) {
            foreach ($questionIds as $order => $questionId) {
                Question::where('id', $questionId)->update(['order' => $order + 1]);
            }

            Log::info("Questions reordered for test");
            return true;
        });
    }

    /**
     * Validate question configuration based on type
     * Returns array of errors, empty if valid
     *
     * @param Question|array $data
     * @return array
     */
    public function validateQuestionConfiguration($data): array
    {
        $errors = [];
        
        // Handle Question model
        if ($data instanceof Question) {
            $question = $data;
            $type = $question->type;

            // Check for question text
            if (empty($question->question_text)) {
                $errors[] = "Question must have text";
            }

            if ($type === 'mcq' || $type === 'single_answer') {
                $options = $question->options;

                if ($options->isEmpty()) {
                    $errors[] = "{$type} questions must have at least 2 options.";
                } elseif ($options->count() < 2) {
                    $errors[] = "{$type} questions must have at least 2 options.";
                }

                $correctCount = $options->where('is_correct', true)->count();

                if ($correctCount === 0) {
                    $errors[] = "{$type} questions must have at least one correct answer.";
                }

                if ($type === 'single_answer' && $correctCount > 1) {
                    $errors[] = "Single answer questions must have exactly one correct answer.";
                }
            } elseif ($type === 'text') {
                if (!$question->textConfig) {
                    $errors[] = "Text question must have configuration";
                } elseif (empty($question->textConfig->expected_answer_guidelines)) {
                    $errors[] = "Text question must have expected answer guidelines";
                }
            }

            return $errors;
        }

        // Handle array data (for validation during creation)
        $type = $data['type'] ?? null;

        if ($type === 'mcq' || $type === 'single_answer') {
            // Validate options exist
            if (!isset($data['options']) || !is_array($data['options'])) {
                $errors[] = "Options are required for {$type} questions.";
                return $errors;
            }

            $options = $data['options'];

            // Validate minimum options
            if (count($options) < 2) {
                $errors[] = "{$type} questions must have at least 2 options.";
            }

            // Validate each option has text
            foreach ($options as $index => $option) {
                if (empty($option['option_text'])) {
                    $errors[] = "Option " . ($index + 1) . " text is required.";
                }
            }

            // Validate correct answers
            $correctCount = count(array_filter($options, fn($opt) => $opt['is_correct'] ?? false));

            if ($correctCount === 0) {
                $errors[] = "{$type} questions must have at least one correct answer.";
            }

            if ($type === 'single_answer' && $correctCount > 1) {
                $errors[] = "Single answer questions must have exactly one correct answer.";
            }
        } elseif ($type === 'text') {
            // Validate text config
            if (!isset($data['text_config']) || !is_array($data['text_config'])) {
                $errors[] = "Text configuration is required for text questions.";
                return $errors;
            }

            $config = $data['text_config'];

            if (empty($config['expected_answer_guidelines'])) {
                $errors[] = "Expected answer guidelines are required for text questions.";
            }

            // Validate character limits if provided
            if (isset($config['min_characters']) && isset($config['max_characters'])) {
                if ($config['min_characters'] > $config['max_characters']) {
                    $errors[] = "Minimum character limit cannot be greater than maximum character limit.";
                }
            }

            if (isset($config['min_characters']) && $config['min_characters'] < 0) {
                $errors[] = "Minimum character limit must be non-negative.";
            }

            if (isset($config['max_characters']) && $config['max_characters'] < 0) {
                $errors[] = "Maximum character limit must be non-negative.";
            }
        }

        return $errors;
    }

    /**
     * Add options to an MCQ or single answer question
     *
     * @param Question $question
     * @param array $data
     * @return void
     * @throws Exception
     */
    private function addQuestionOptions(Question $question, array $data): void
    {
        if (!isset($data['options']) || !is_array($data['options'])) {
            throw new Exception("Options are required for {$data['type']} questions.");
        }

        foreach ($data['options'] as $order => $optionData) {
            $optionData['question_id'] = $question->id;
            $optionData['order'] = $order + 1;
            $optionData['is_correct'] = $optionData['is_correct'] ?? false;

            QuestionOption::create($optionData);
        }
    }

    /**
     * Update options for an MCQ or single answer question
     *
     * @param Question $question
     * @param array $options
     * @return void
     */
    private function updateQuestionOptions(Question $question, array $options): void
    {
        // Delete existing options
        $question->options()->delete();

        // Create new options
        foreach ($options as $order => $optionData) {
            $optionData['question_id'] = $question->id;
            $optionData['order'] = $order + 1;
            $optionData['is_correct'] = $optionData['is_correct'] ?? false;

            QuestionOption::create($optionData);
        }
    }

    /**
     * Add text configuration to a text question
     *
     * @param Question $question
     * @param array $data
     * @return void
     */
    private function addTextQuestionConfig(Question $question, array $data): void
    {
        if (!isset($data['text_config']) || !is_array($data['text_config'])) {
            throw new Exception("Text configuration is required for text questions.");
        }

        $configData = $data['text_config'];
        $configData['question_id'] = $question->id;

        TextQuestionConfig::create($configData);
    }

    /**
     * Update text configuration for a text question
     *
     * @param Question $question
     * @param array $config
     * @return void
     */
    private function updateTextQuestionConfig(Question $question, array $config): void
    {
        $textConfig = $question->textConfig;

        if ($textConfig) {
            $textConfig->update($config);
        } else {
            $config['question_id'] = $question->id;
            TextQuestionConfig::create($config);
        }
    }

    /**
     * Reorder questions after deletion to maintain sequence
     *
     * @param int $testId
     * @return void
     */
    private function reorderQuestionsAfterDelete(int $testId): void
    {
        $questions = Question::where('skill_test_id', $testId)
            ->orderBy('order')
            ->get();

        foreach ($questions as $index => $question) {
            $question->update(['order' => $index + 1]);
        }
    }

    /**
     * Get all questions for a test
     *
     * @param SkillTest $test
     * @return EloquentCollection
     */
    public function getTestQuestions(SkillTest $test): EloquentCollection
    {
        return $test->questions()
            ->with(['options', 'textConfig'])
            ->orderBy('order')
            ->get();
    }

    /**
     * Get a specific question with all its data
     *
     * @param int $questionId
     * @return Question
     * @throws Exception
     */
    public function getQuestion(int $questionId): Question
    {
        $question = Question::with(['options', 'textConfig'])->find($questionId);

        if (!$question) {
            throw new Exception("Question not found.");
        }

        return $question;
    }

    /**
     * Get questions by type for a test
     *
     * @param SkillTest $test
     * @param string $type
     * @return EloquentCollection
     */
    public function getQuestionsByType(SkillTest $test, string $type): EloquentCollection
    {
        $validTypes = ['mcq', 'text', 'single_answer'];

        if (!in_array($type, $validTypes)) {
            throw new Exception("Invalid question type: {$type}");
        }

        return $test->questions()
            ->where('type', $type)
            ->with(['options', 'textConfig'])
            ->orderBy('order')
            ->get();
    }

    /**
     * Get question statistics for a test
     *
     * @param SkillTest $test
     * @return array
     */
    public function getTestQuestionStats(SkillTest $test): array
    {
        $questions = $test->questions()->get();

        return [
            'total_questions' => $questions->count(),
            'mcq_count' => $questions->where('type', 'mcq')->count(),
            'text_count' => $questions->where('type', 'text')->count(),
            'single_answer_count' => $questions->where('type', 'single_answer')->count(),
            'total_points' => $questions->sum('points'),
        ];
    }

    /**
     * Get all questions for a test (alias for getTestQuestions)
     *
     * @param SkillTest $test
     * @return EloquentCollection
     */
    public function getQuestions(SkillTest $test): EloquentCollection
    {
        return $this->getTestQuestions($test);
    }

    /**
     * Duplicate a question within the same test or to another test
     *
     * @param Question $question
     * @param SkillTest $targetTest
     * @return Question
     * @throws Exception
     */
    public function duplicateQuestion(Question $question, SkillTest $targetTest): Question
    {
        return DB::transaction(function () use ($question, $targetTest) {
            // Get the next order number for target test
            $nextOrder = $targetTest->questions()->max('order') + 1;

            // Create new question
            $newQuestionData = [
                'skill_test_id' => $targetTest->id,
                'type' => $question->type,
                'question_text' => $question->question_text,
                'points' => $question->points,
                'order' => $nextOrder,
            ];

            $newQuestion = Question::create($newQuestionData);

            // Copy options if MCQ or single answer
            if ($question->isMCQ() || $question->isSingleAnswer()) {
                foreach ($question->options as $option) {
                    $newOptionData = $option->toArray();
                    unset($newOptionData['id']);
                    unset($newOptionData['created_at']);
                    unset($newOptionData['updated_at']);
                    $newOptionData['question_id'] = $newQuestion->id;

                    QuestionOption::create($newOptionData);
                }
            }

            // Copy text config if text question
            if ($question->isText() && $question->textConfig) {
                $newConfigData = $question->textConfig->toArray();
                unset($newConfigData['id']);
                unset($newConfigData['created_at']);
                unset($newConfigData['updated_at']);
                $newConfigData['question_id'] = $newQuestion->id;

                TextQuestionConfig::create($newConfigData);
            }

            Log::info("Question duplicated: {$question->id} -> {$newQuestion->id}");
            return $newQuestion->load(['options', 'textConfig']);
        });
    }

    /**
     * Get statistics for a specific question
     *
     * @param Question $question
     * @return array
     */
    public function getQuestionStats(Question $question): array
    {
        $stats = [
            'id' => $question->id,
            'type' => $question->type,
            'question_text' => $question->question_text,
            'points' => $question->points,
            'order' => $question->order,
        ];

        if ($question->isMCQ() || $question->isSingleAnswer()) {
            $stats['option_count'] = $question->options()->count();
            $stats['correct_option_count'] = $question->options()->where('is_correct', true)->count();
        } elseif ($question->isText()) {
            $config = $question->textConfig;
            $stats['min_characters'] = $config?->min_characters;
            $stats['max_characters'] = $config?->max_characters;
            $stats['expected_answer_guidelines'] = $config?->expected_answer_guidelines;
        }

        return $stats;
    }
}
