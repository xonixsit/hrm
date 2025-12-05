<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\SkillTest;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\TextQuestionConfig;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SkillTestControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $hr;
    private User $manager;
    private User $employee;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create()->assignRole('Admin');
        $this->hr = User::factory()->create()->assignRole('HR');
        $this->manager = User::factory()->create()->assignRole('Manager');
        $this->employee = User::factory()->create()->assignRole('Employee');
    }

    /**
     * Test admin can view skill tests index
     */
    public function test_admin_can_view_skill_tests_index()
    {
        $this->actingAs($this->admin);

        $response = $this->get(route('skill-tests.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('SkillTests/Index')
            ->has('tests')
            ->has('filters')
        );
    }

    /**
     * Test HR can view skill tests index
     */
    public function test_hr_can_view_skill_tests_index()
    {
        $this->actingAs($this->hr);

        $response = $this->get(route('skill-tests.index'));

        $response->assertStatus(200);
    }

    /**
     * Test manager can view skill tests index
     */
    public function test_manager_can_view_skill_tests_index()
    {
        $this->actingAs($this->manager);

        $response = $this->get(route('skill-tests.index'));

        $response->assertStatus(200);
    }

    /**
     * Test employee cannot view skill tests index
     */
    public function test_employee_cannot_view_skill_tests_index()
    {
        $this->actingAs($this->employee);

        $response = $this->get(route('skill-tests.index'));

        $response->assertStatus(403);
    }

    /**
     * Test admin can view create form
     */
    public function test_admin_can_view_create_form()
    {
        $this->actingAs($this->admin);

        $response = $this->get(route('skill-tests.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('SkillTests/Create'));
    }

    /**
     * Test HR can view create form
     */
    public function test_hr_can_view_create_form()
    {
        $this->actingAs($this->hr);

        $response = $this->get(route('skill-tests.create'));

        $response->assertStatus(200);
    }

    /**
     * Test employee cannot view create form
     */
    public function test_employee_cannot_view_create_form()
    {
        $this->actingAs($this->employee);

        $response = $this->get(route('skill-tests.create'));

        $response->assertStatus(403);
    }

    /**
     * Test admin can create skill test
     */
    public function test_admin_can_create_skill_test()
    {
        $this->actingAs($this->admin);

        $data = [
            'name' => 'JavaScript Basics',
            'description' => 'Test basic JavaScript knowledge',
            'category' => 'Programming',
            'difficulty_level' => 'easy',
            'passing_score' => 70,
            'time_limit' => 60,
            'max_attempts' => 3,
            'randomize_questions' => false,
            'randomize_answers' => false,
            'show_correct_answers' => false,
            'show_explanations' => false,
            'feedback_timing' => 'immediate',
        ];

        $response = $this->post(route('skill-tests.store'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('skill_tests', [
            'name' => 'JavaScript Basics',
            'status' => 'draft',
            'created_by' => $this->admin->id,
        ]);
    }

    /**
     * Test HR can create skill test
     */
    public function test_hr_can_create_skill_test()
    {
        $this->actingAs($this->hr);

        $data = [
            'name' => 'Python Basics',
            'description' => 'Test basic Python knowledge',
            'category' => 'Programming',
            'difficulty_level' => 'medium',
            'passing_score' => 75,
            'max_attempts' => 2,
            'feedback_timing' => 'immediate',
        ];

        $response = $this->post(route('skill-tests.store'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('skill_tests', ['name' => 'Python Basics']);
    }

    /**
     * Test employee cannot create skill test
     */
    public function test_employee_cannot_create_skill_test()
    {
        $this->actingAs($this->employee);

        $data = [
            'name' => 'Test',
            'description' => 'Test',
            'category' => 'Programming',
            'difficulty_level' => 'easy',
            'passing_score' => 70,
            'max_attempts' => 1,
            'feedback_timing' => 'immediate',
        ];

        $response = $this->post(route('skill-tests.store'), $data);

        $response->assertStatus(403);
    }

    /**
     * Test admin can view edit form
     */
    public function test_admin_can_view_edit_form()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'draft']);

        $response = $this->get(route('skill-tests.edit', $test));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('SkillTests/Edit')
            ->has('test')
        );
    }

    /**
     * Test admin can update skill test
     */
    public function test_admin_can_update_skill_test()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'draft']);

        $data = [
            'name' => 'Updated Test Name',
            'description' => 'Updated description',
            'category' => 'Programming',
            'difficulty_level' => 'hard',
            'passing_score' => 80,
            'max_attempts' => 2,
            'feedback_timing' => 'after_deadline',
        ];

        $response = $this->patch(route('skill-tests.update', $test), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('skill_tests', [
            'id' => $test->id,
            'name' => 'Updated Test Name',
            'passing_score' => 80,
        ]);
    }

    /**
     * Test admin cannot update published test
     */
    public function test_admin_cannot_update_published_test()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'published']);

        $data = [
            'name' => 'Updated Name',
            'description' => 'Updated',
            'category' => 'Programming',
            'difficulty_level' => 'easy',
            'passing_score' => 70,
            'max_attempts' => 1,
            'feedback_timing' => 'immediate',
        ];

        $response = $this->patch(route('skill-tests.update', $test), $data);

        $response->assertStatus(403);
    }

    /**
     * Test admin can delete draft test
     */
    public function test_admin_can_delete_draft_test()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'draft']);

        $response = $this->delete(route('skill-tests.destroy', $test));

        $response->assertRedirect();
        $this->assertSoftDeleted('skill_tests', ['id' => $test->id]);
    }

    /**
     * Test admin cannot delete published test
     */
    public function test_admin_cannot_delete_published_test()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'published']);

        $response = $this->delete(route('skill-tests.destroy', $test));

        $response->assertStatus(403);
    }

    /**
     * Test admin can publish draft test with valid questions
     */
    public function test_admin_can_publish_draft_test()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'draft']);

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

        $response = $this->post(route('skill-tests.publish', $test));

        $response->assertRedirect();
        $this->assertDatabaseHas('skill_tests', [
            'id' => $test->id,
            'status' => 'published',
        ]);
    }

    /**
     * Test admin can archive published test
     */
    public function test_admin_can_archive_published_test()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'published']);

        $response = $this->post(route('skill-tests.archive', $test));

        $response->assertRedirect();
        $this->assertDatabaseHas('skill_tests', [
            'id' => $test->id,
            'status' => 'archived',
        ]);
    }

    /**
     * Test admin cannot archive draft test
     */
    public function test_admin_cannot_archive_draft_test()
    {
        $this->actingAs($this->admin);
        $test = SkillTest::factory()->create(['created_by' => $this->admin->id, 'status' => 'draft']);

        $response = $this->post(route('skill-tests.archive', $test));

        $response->assertStatus(403);
    }

    /**
     * Test skill test creation with invalid passing score
     */
    public function test_skill_test_creation_with_invalid_passing_score()
    {
        $this->actingAs($this->admin);

        $data = [
            'name' => 'Invalid Test',
            'description' => 'Test with invalid score',
            'category' => 'Programming',
            'difficulty_level' => 'easy',
            'passing_score' => 150,
            'max_attempts' => 1,
            'feedback_timing' => 'immediate',
        ];

        $response = $this->post(route('skill-tests.store'), $data);

        $response->assertSessionHasErrors('passing_score');
    }

    /**
     * Test skill test creation with missing required fields
     */
    public function test_skill_test_creation_with_missing_fields()
    {
        $this->actingAs($this->admin);

        $data = [
            'name' => 'Incomplete Test',
            // Missing description, category, etc.
        ];

        $response = $this->post(route('skill-tests.store'), $data);

        $response->assertSessionHasErrors(['description', 'category', 'difficulty_level']);
    }
}
