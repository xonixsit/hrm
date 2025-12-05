<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\SkillTest;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\TextQuestionConfig;
use App\Models\User;
use App\Services\QuestionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Exception;

class QuestionServiceTest extends TestCase
{
    use RefreshDatabase;

    private QuestionService $service;
    private SkillTest $test;
    private User $creator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new QuestionService();
        $this->creator = User::factory()->create();
        $this->test = SkillTest::factory()->create(['created_by' => $this->creator->id]);
    }

    // ==================== addQuestion Tests ====================

    /**
     * Test adding a valid MCQ question
     */
    public function test_add_mcq_question_with_valid_data()
    {
        $data = [
            'type' => 'mcq',
            'question_text' => 'What is 2+2?',
            'points' => 10,
            'options' => [
                ['option_text' => '4', 'is_correct' => true, 'explanation' => 'Correct answer'],
                ['option_text' => '5', 'is_correct' => false, 'explanation' => 'Incorrect'],
            ],
        ];

        $question = $this->service->addQuestion($this->test, $data);

        $this->assertInstanceOf(Question::class, $question);
        $this->assertEquals('mcq', $question->type);
        $this->assertEquals('What is 2+2?', $question->question_text);
        $this->assertEquals(10, $question->points);
        $this->assertEquals(1, $question->order);
        $this->assertCount(2, $question->options);
    }

    /**
     * Test adding a valid text question
     */
    public function test_add_text_question_with_valid_data()
    {
        $data = [
            'type' => 'text',
            'question_text' => 'Explain the concept',
            'points' => 15,
            'text_config' => [
                'expected_answer_guidelines' => 'Should explain clearly',
                'min_characters' => 50,
                'max_characters' => 500,
            ],
        ];

        $question = $this->service->addQuestion($this->test, $data);

        $this->assertInstanceOf(Question::class, $question);
        $this->assertEquals('text', $question->type);
        $this->assertNotNull($question->textConfig);
        $this->assertEquals(50, $question->textConfig->min_characters);
        $this->assertEquals(500, $question->textConfig->max_characters);
    }

    /**
     * Test adding a valid single answer question
     */
    public function test_add_single_answer_question_with_valid_data()
    {
        $data = [
            'type' => 'single_answer',
            'question_text' => 'What is the capital of France?',
            'points' => 5,
            'options' => [
                ['option_text' => 'Paris', 'is_correct' => true],
                ['option_text' => 'London', 'is_correct' => false],
                ['option_text' => 'Berlin', 'is_correct' => false],
            ],
        ];

        $question = $this->service->addQuestion($this->test, $data);

        $this->assertEquals('single_answer', $question->type);
        $this->assertCount(3, $question->options);
        $this->assertEquals(1, $question->options->where('is_correct', true)->count());
    }

    /**
     * Test adding question without question text throws exception
     */
    public function test_add_question_without_text_throws_exception()
    {
        $data = [
            'type' => 'mcq',
            'question_text' => '',
            'points' => 10,
            'options' => [
                ['option_text' => '4', 'is_correct' => true],
                ['option_text' => '5', 'is_correct' => false],
            ],
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Question text is required.");

        $this->service->addQuestion($this->test, $data);
    }

    /**
     * Test adding question with invalid type throws exception
     */
    public function test_add_question_with_invalid_type_throws_exception()
    {
        $data = [
            'type' => 'invalid_type',
            'question_text' => 'Test question',
            'points' => 10,
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Invalid question type");

        $this->service->addQuestion($this->test, $data);
    }

    /**
     * Test adding MCQ with less than 2 options throws exception
     */
    public function test_add_mcq_with_one_option_throws_exception()
    {
        $data = [
            'type' => 'mcq',
            'question_text' => 'Test question',
            'points' => 10,
            'options' => [
                ['option_text' => '4', 'is_correct' => true],
            ],
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("must have at least 2 options");

        $this->service->addQuestion($this->test, $data);
    }

    /**
     * Test adding MCQ without correct answer throws exception
     */
    public function test_add_mcq_without_correct_answer_throws_exception()
    {
        $data = [
            'type' => 'mcq',
            'question_text' => 'Test question',
            'points' => 10,
            'options' => [
                ['option_text' => '4', 'is_correct' => false],
                ['option_text' => '5', 'is_correct' => false],
            ],
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("must have at least one correct answer");

        $this->service->addQuestion($this->test, $data);
    }

    /**
     * Test adding single answer with multiple correct answers throws exception
     */
    public function test_add_single_answer_with_multiple_correct_throws_exception()
    {
        $data = [
            'type' => 'single_answer',
            'question_text' => 'Test question',
            'points' => 10,
            'options' => [
                ['option_text' => 'A', 'is_correct' => true],
                ['option_text' => 'B', 'is_correct' => true],
            ],
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("exactly one correct answer");

        $this->service->addQuestion($this->test, $data);
    }

    /**
     * Test adding text question without guidelines throws exception
     */
    public function test_add_text_question_without_guidelines_throws_exception()
    {
        $data = [
            'type' => 'text',
            'question_text' => 'Test question',
            'points' => 10,
            'text_config' => [
                'expected_answer_guidelines' => '',
            ],
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Expected answer guidelines are required");

        $this->service->addQuestion($this->test, $data);
    }

    /**
     * Test adding text question with invalid character limits throws exception
     */
    public function test_add_text_question_with_invalid_limits_throws_exception()
    {
        $data = [
            'type' => 'text',
            'question_text' => 'Test question',
            'points' => 10,
            'text_config' => [
                'expected_answer_guidelines' => 'Guidelines',
                'min_characters' => 500,
                'max_characters' => 100,
            ],
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Minimum character limit cannot be greater than maximum");

        $this->service->addQuestion($this->test, $data);
    }

    /**
     * Test question order increments correctly
     */
    public function test_question_order_increments()
    {
        $data1 = [
            'type' => 'mcq',
            'question_text' => 'Question 1',
            'points' => 10,
            'options' => [
                ['option_text' => 'A', 'is_correct' => true],
                ['option_text' => 'B', 'is_correct' => false],
            ],
        ];

        $data2 = [
            'type' => 'mcq',
            'question_text' => 'Question 2',
            'points' => 10,
            'options' => [
                ['option_text' => 'A', 'is_correct' => true],
                ['option_text' => 'B', 'is_correct' => false],
            ],
        ];

        $q1 = $this->service->addQuestion($this->test, $data1);
        $q2 = $this->service->addQuestion($this->test, $data2);

        $this->assertEquals(1, $q1->order);
        $this->assertEquals(2, $q2->order);
    }

    // ==================== updateQuestion Tests ====================

    /**
     * Test updating question text
     */
    public function test_update_question_text()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
            'question_text' => 'Original text',
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $updated = $this->service->updateQuestion($question, [
            'question_text' => 'Updated text',
        ]);

        $this->assertEquals('Updated text', $updated->question_text);
    }

    /**
     * Test updating question points
     */
    public function test_update_question_points()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
            'points' => 10,
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $updated = $this->service->updateQuestion($question, [
            'points' => 20,
        ]);

        $this->assertEquals(20, $updated->points);
    }

    /**
     * Test updating MCQ options
     */
    public function test_update_mcq_options()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $newOptions = [
            ['option_text' => 'New A', 'is_correct' => true],
            ['option_text' => 'New B', 'is_correct' => false],
            ['option_text' => 'New C', 'is_correct' => false],
        ];

        $updated = $this->service->updateQuestion($question, [
            'options' => $newOptions,
        ]);

        $this->assertCount(3, $updated->options);
        $this->assertEquals('New A', $updated->options->first()->option_text);
    }

    /**
     * Test updating text question config
     */
    public function test_update_text_question_config()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'text',
        ]);

        TextQuestionConfig::factory()->create([
            'question_id' => $question->id,
            'min_characters' => 50,
            'max_characters' => 500,
        ]);

        $updated = $this->service->updateQuestion($question, [
            'text_config' => [
                'expected_answer_guidelines' => 'Updated guidelines',
                'min_characters' => 100,
                'max_characters' => 1000,
            ],
        ]);

        $this->assertEquals(100, $updated->textConfig->min_characters);
        $this->assertEquals(1000, $updated->textConfig->max_characters);
    }

    /**
     * Test updating with empty question text throws exception
     */
    public function test_update_question_with_empty_text_throws_exception()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
        ]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Question text cannot be empty");

        $this->service->updateQuestion($question, [
            'question_text' => '',
        ]);
    }

    // ==================== deleteQuestion Tests ====================

    /**
     * Test deleting a question
     */
    public function test_delete_question()
    {
        $question = Question::factory()->create(['skill_test_id' => $this->test->id]);
        QuestionOption::factory()->create(['question_id' => $question->id]);

        $result = $this->service->deleteQuestion($question);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }

    /**
     * Test deleting question also deletes options
     */
    public function test_delete_question_deletes_options()
    {
        $question = Question::factory()->create(['skill_test_id' => $this->test->id, 'type' => 'mcq']);
        $option = QuestionOption::factory()->create(['question_id' => $question->id]);

        $this->service->deleteQuestion($question);

        $this->assertDatabaseMissing('question_options', ['id' => $option->id]);
    }

    /**
     * Test deleting text question also deletes config
     */
    public function test_delete_text_question_deletes_config()
    {
        $question = Question::factory()->create(['skill_test_id' => $this->test->id, 'type' => 'text']);
        $config = TextQuestionConfig::factory()->create(['question_id' => $question->id]);

        $this->service->deleteQuestion($question);

        $this->assertDatabaseMissing('text_question_configs', ['id' => $config->id]);
    }

    // ==================== reorderQuestions Tests ====================

    /**
     * Test reordering questions with provided IDs
     */
    public function test_reorder_questions_with_ids()
    {
        $q1 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 1]);
        $q2 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 2]);
        $q3 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 3]);

        $this->service->reorderQuestions($this->test, [$q3->id, $q1->id, $q2->id]);

        $this->assertEquals(1, $q3->fresh()->order);
        $this->assertEquals(2, $q1->fresh()->order);
        $this->assertEquals(3, $q2->fresh()->order);
    }

    /**
     * Test reordering questions without IDs reorders sequentially
     */
    public function test_reorder_questions_without_ids()
    {
        $q1 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 5]);
        $q2 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 10]);
        $q3 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 3]);

        $this->service->reorderQuestions($this->test);

        $questions = $this->test->questions()->orderBy('order')->get();
        $this->assertEquals(1, $questions[0]->order);
        $this->assertEquals(2, $questions[1]->order);
        $this->assertEquals(3, $questions[2]->order);
    }

    /**
     * Test reordering with invalid question ID throws exception
     */
    public function test_reorder_with_invalid_id_throws_exception()
    {
        $q1 = Question::factory()->create(['skill_test_id' => $this->test->id]);
        $otherTest = SkillTest::factory()->create(['created_by' => $this->creator->id]);
        $q2 = Question::factory()->create(['skill_test_id' => $otherTest->id]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("do not belong to this test");

        $this->service->reorderQuestions($this->test, [$q1->id, $q2->id]);
    }

    // ==================== validateQuestionConfiguration Tests ====================

    /**
     * Test validating properly configured MCQ question
     */
    public function test_validate_valid_mcq_question()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
            'question_text' => 'Test',
            'points' => 10,
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $errors = $this->service->validateQuestionConfiguration($question);

        $this->assertEmpty($errors);
    }

    /**
     * Test validating MCQ without correct answer
     */
    public function test_validate_mcq_without_correct_answer()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
            'question_text' => 'Test',
            'points' => 10,
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $errors = $this->service->validateQuestionConfiguration($question);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('correct answer', $errors[0]);
    }

    /**
     * Test validating text question with valid config
     */
    public function test_validate_valid_text_question()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'text',
            'question_text' => 'Test',
            'points' => 10,
        ]);

        TextQuestionConfig::factory()->create([
            'question_id' => $question->id,
            'expected_answer_guidelines' => 'Guidelines',
        ]);

        $errors = $this->service->validateQuestionConfiguration($question);

        $this->assertEmpty($errors);
    }

    /**
     * Test validating text question without config
     */
    public function test_validate_text_question_without_config()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'text',
            'question_text' => 'Test',
            'points' => 10,
        ]);

        $errors = $this->service->validateQuestionConfiguration($question);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('configuration', $errors[0]);
    }

    /**
     * Test validating question without text
     */
    public function test_validate_question_without_text()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
            'question_text' => '',
            'points' => 10,
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $errors = $this->service->validateQuestionConfiguration($question);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('text', $errors[0]);
    }

    // ==================== getQuestions Tests ====================

    /**
     * Test getting all questions for a test
     */
    public function test_get_questions()
    {
        Question::factory()->count(3)->create(['skill_test_id' => $this->test->id]);

        $questions = $this->service->getQuestions($this->test);

        $this->assertCount(3, $questions);
    }

    /**
     * Test getting questions returns them in order
     */
    public function test_get_questions_ordered()
    {
        $q1 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 1]);
        $q2 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 2]);
        $q3 = Question::factory()->create(['skill_test_id' => $this->test->id, 'order' => 3]);

        $questions = $this->service->getQuestions($this->test);

        $this->assertEquals($q1->id, $questions[0]->id);
        $this->assertEquals($q2->id, $questions[1]->id);
        $this->assertEquals($q3->id, $questions[2]->id);
    }

    // ==================== duplicateQuestion Tests ====================

    /**
     * Test duplicating an MCQ question
     */
    public function test_duplicate_mcq_question()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
            'question_text' => 'Original',
            'points' => 10,
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $duplicate = $this->service->duplicateQuestion($question, $this->test);

        $this->assertNotEquals($question->id, $duplicate->id);
        $this->assertEquals($question->question_text, $duplicate->question_text);
        $this->assertCount(2, $duplicate->options);
    }

    /**
     * Test duplicating a text question
     */
    public function test_duplicate_text_question()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'text',
            'question_text' => 'Original',
        ]);

        TextQuestionConfig::factory()->create([
            'question_id' => $question->id,
            'expected_answer_guidelines' => 'Guidelines',
            'min_characters' => 50,
        ]);

        $duplicate = $this->service->duplicateQuestion($question, $this->test);

        $this->assertNotNull($duplicate->textConfig);
        $this->assertEquals(50, $duplicate->textConfig->min_characters);
    }

    // ==================== getQuestionStats Tests ====================

    /**
     * Test getting question statistics
     */
    public function test_get_question_stats()
    {
        $question = Question::factory()->create([
            'skill_test_id' => $this->test->id,
            'type' => 'mcq',
            'question_text' => 'Test',
            'points' => 10,
            'order' => 1,
        ]);

        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $stats = $this->service->getQuestionStats($question);

        $this->assertEquals($question->id, $stats['id']);
        $this->assertEquals('mcq', $stats['type']);
        $this->assertEquals(2, $stats['option_count']);
        $this->assertEquals(1, $stats['correct_option_count']);
    }
}
