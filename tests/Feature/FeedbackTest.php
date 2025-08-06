<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_feedback()
    {
        $reviewer = User::factory()->create();
        $reviewee = Employee::factory()->create();
        $this->actingAs($reviewer);

        $response = $this->post(route('feedbacks.store'), [
            'reviewee_id' => $reviewee->id,
            'period' => 'Q1 2023',
            'comments' => 'Great performance',
            'rating' => 5,
        ]);

        $response->assertRedirect(route('feedbacks.index'));
        $this->assertDatabaseHas('feedbacks', ['reviewer_id' => $reviewer->id, 'reviewee_id' => $reviewee->id, 'rating' => 5]);
    }

    public function test_user_can_view_feedbacks()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('feedbacks.index'));

        $response->assertStatus(200);
    }
}
