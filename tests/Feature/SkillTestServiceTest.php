<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\SkillTest;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\TextQuestionConfig;
use App\Models\User;
use App\Services\SkillTestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Exception;

class SkillTestServiceTest extends TestCase
{
    use RefreshDatabase;

    private SkillTestService $service;
    private User $creator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SkillTestService();
        $this->creator = User::factory()->create();
    }

    /**
     * Test creating a skill test with valid data
     */
    public function test_create_test_with_valid_data()
    {
        $data = [
            'name' => 'JavaScript Basics',
            'description' => 'Test basic JavaScript knowledge',
            'category' => 'Programming',
            'difficulty_level' => 'easy',
            'passing_score' => 70,
            'max_attempts' => 3,
        ];

        $test = $this->service->createTest($data, $this->creator);

        $this->assertInstanceOf(SkillTest::class, $test);
        $this->assertEquals('JavaScript Basics', $test->name);
        $this->assertEquals('draft', $test->status);
        $this->assertEquals($this->creator->id, $test->created_by);
    }

    /**
     * Test creating a test with duplicate name throws exception
     */
    public function test_create_test_with_duplicate_name_throws_exception()
    {
        $data = [
            'name' => 'Duplicate Test',
            'description' => 'First test',
            'category' => 'Programming',
            'difficulty_level' => 'easy',
        ];

        $this->service->createTest($data, $this->creator);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("A skill test with the name 'Duplicate Test' already exists.");

        $this->service->createTest($data, $this->creator);
    }

    /**
     * Test creating a test without name throws exception
     */
    public function test_create_test_without_name_throws_exception()
    {
        $data = [
            'name' => '',
            'description' => 'Test without name',
            'category' => 'Programming',
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Test name is required.");

        $this->service->createTest($data, $this->creator);
    }

    /**
     * Test creating a test with invalid passing score throws exception
     */
    public function test_create_test_with_invalid_passing_score_throws_exception()
    {
        $data = [
            'name' => 'Invalid Score Test',
            'description' => 'Test with invalid score',
            'category' => 'Programming',
            'passing_score' => 150,
        ];

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Passing score must be between 0 and 100.");

        $this->service->createTest($data, $this->creator);
    }

    /**
     * Test updating a skill test
     */
    public function test_update_test()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id]);

        $updatedData = [
            'description' => 'Updated description',
            'passing_score' => 80,
        ];

        $updated = $this->service->updateTest($test, $updatedData);

        $this->assertEquals('Updated description', $updated->description);
        $this->assertEquals(80, $updated->passing_score);
    }

    /**
     * Test publishing a test without questions throws exception
     */
    public function test_publish_test_without_questions_throws_exception()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Cannot publish test without at least one question.");

        $this->service->publishTest($test);
    }

    /**
     * Test publishing a test with properly configured MCQ question
     */
    public function test_publish_test_with_valid_mcq_question()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id]);

        $question = Question::factory()->create([
            'skill_test_id' => $test->id,
            'type' => 'mcq',
            'question_text' => 'What is 2+2?',
            'points' => 10,
        ]);

        QuestionOption::factory()->create([
            'question_id' => $question->id,
            'option_text' => '4',
            'is_correct' => true,
        ]);

        QuestionOption::factory()->create([
            'question_id' => $question->id,
            'option_text' => '5',
            'is_correct' => false,
        ]);

        $published = $this->service->publishTest($test);

        $this->assertEquals('published', $published->status);
    }

    /**
     * Test publishing MCQ question without correct answer throws exception
     */
    public function test_publish_mcq_without_correct_answer_throws_exception()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id]);

        $question = Question::factory()->create([
            'skill_test_id' => $test->id,
            'type' => 'mcq',
            'question_text' => 'What is 2+2?',
            'points' => 10,
        ]);

        QuestionOption::factory()->create([
            'question_id' => $question->id,
            'option_text' => '4',
            'is_correct' => false,
        ]);

        QuestionOption::factory()->create([
            'question_id' => $question->id,
            'option_text' => '5',
            'is_correct' => false,
        ]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage("must have at least one correct answer");

        $this->service->publishTest($test);
    }

    /**
     * Test publishing text question with valid configuration
     */
    public function test_publish_test_with_valid_text_question()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id]);

        $question = Question::factory()->create([
            'skill_test_id' => $test->id,
            'type' => 'text',
            'question_text' => 'Explain the concept',
            'points' => 10,
        ]);

        TextQuestionConfig::factory()->create([
            'question_id' => $question->id,
            'expected_answer_guidelines' => 'Should explain the concept clearly',
            'min_characters' => 50,
            'max_characters' => 500,
        ]);

        $published = $this->service->publishTest($test);

        $this->assertEquals('published', $published->status);
    }

    /**
     * Test publishing single answer question with exactly one correct answer
     */
    public function test_publish_single_answer_with_one_correct_answer()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id]);

        $question = Question::factory()->create([
            'skill_test_id' => $test->id,
            'type' => 'single_answer',
            'question_text' => 'What is the capital of France?',
            'points' => 10,
        ]);

        QuestionOption::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'Paris',
            'is_correct' => true,
        ]);

        QuestionOption::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'London',
            'is_correct' => false,
        ]);

        $published = $this->service->publishTest($test);

        $this->assertEquals('published', $published->status);
    }

    /**
     * Test archiving a test
     */
    public function test_archive_test()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id, 'status' => 'published']);

        $archived = $this->service->archiveTest($test);

        $this->assertEquals('archived', $archived->status);
    }

    /**
     * Test getting tests by status
     */
    public function test_get_tests_by_status()
    {
        SkillTest::factory()->count(3)->create(['status' => 'draft', 'created_by' => $this->creator->id]);
        SkillTest::factory()->count(2)->create(['status' => 'published', 'created_by' => $this->creator->id]);

        $draftTests = $this->service->getTestsByStatus('draft');
        $publishedTests = $this->service->getTestsByStatus('published');

        $this->assertCount(3, $draftTests);
        $this->assertCount(2, $publishedTests);
    }

    /**
     * Test getting tests by invalid status throws exception
     */
    public function test_get_tests_by_invalid_status_throws_exception()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Invalid status");

        $this->service->getTestsByStatus('invalid_status');
    }

    /**
     * Test deleting a test
     */
    public function test_delete_test()
    {
        $test = SkillTest::factory()->create(['created_by' => $this->creator->id]);

        $result = $this->service->deleteTest($test);

        $this->assertTrue($result);
        $this->assertSoftDeleted('skill_tests', ['id' => $test->id]);
    }

    /**
     * Test getting test statistics
     */
    public function test_get_test_stats()
    {
        $test = SkillTest::factory()->create([
            'name' => 'JavaScript Basics',
            'created_by' => $this->creator->id,
            'passing_score' => 75,
            'max_attempts' => 2,
        ]);

        Question::factory()->count(3)->create([
            'skill_test_id' => $test->id,
            'points' => 10,
        ]);

        $stats = $this->service->getTestStats($test);

        $this->assertEquals($test->id, $stats['id']);
        $this->assertEquals('JavaScript Basics', $stats['name']);
        $this->assertEquals(3, $stats['question_count']);
        $this->assertEquals(30, $stats['total_points']);
        $this->assertEquals(75, $stats['passing_score']);
        $this->assertEquals(2, $stats['max_attempts']);
    }
}
