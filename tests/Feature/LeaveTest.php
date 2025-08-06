<?php

namespace Tests\Feature;

use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaveTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_create_leave_request()
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $leaveType = LeaveType::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('leaves.store'), [
            'leave_type_id' => $leaveType->id,
            'from_date' => now()->format('Y-m-d'),
            'to_date' => now()->addDay()->format('Y-m-d'),
            'reason' => 'Test reason',
        ]);

        $response->assertRedirect(route('leaves.index'));
        $this->assertDatabaseHas('leaves', ['employee_id' => $employee->id, 'status' => 'pending']);
    }

    public function test_manager_can_approve_leave()
    {
        $manager = User::factory()->create()->assignRole('Manager');
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id, 'manager_id' => $manager->id]);
        $leaveType = LeaveType::factory()->create();
        $leave = Leave::factory()->create(['employee_id' => $employee->id, 'leave_type_id' => $leaveType->id, 'status' => 'pending']);
        $this->actingAs($manager);

        $response = $this->patch(route('leaves.update', $leave), ['status' => 'approved']);

        $response->assertRedirect(route('leaves.index'));
        $this->assertDatabaseHas('leaves', ['id' => $leave->id, 'status' => 'approved']);
    }

    public function test_employee_can_view_own_leaves()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('leaves.index'));

        $response->assertStatus(200);
    }
}
