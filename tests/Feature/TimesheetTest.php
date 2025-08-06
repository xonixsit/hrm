<?php

namespace Tests\Feature;

use App\Models\Timesheet;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimesheetTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_create_timesheet()
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $project = Project::factory()->create();
        $task = Task::factory()->create(['project_id' => $project->id]);
        $this->actingAs($user);

        $response = $this->post(route('timesheets.store'), [
            'project_id' => $project->id,
            'task_id' => $task->id,
            'date' => now()->format('Y-m-d'),
            'hours' => 8,
        ]);

        $response->assertRedirect(route('timesheets.index'));
        $this->assertDatabaseHas('timesheets', ['employee_id' => $employee->id, 'hours' => 8]);
    }

    public function test_manager_can_approve_timesheet()
    {
        $manager = User::factory()->create()->assignRole('Manager');
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id, 'manager_id' => $manager->id]);
        $project = Project::factory()->create();
        $task = Task::factory()->create(['project_id' => $project->id]);
        $timesheet = Timesheet::factory()->create(['employee_id' => $employee->id, 'project_id' => $project->id, 'task_id' => $task->id, 'status' => 'pending']);
        $this->actingAs($manager);

        $response = $this->patch(route('timesheets.update', $timesheet), ['status' => 'approved']);

        $response->assertRedirect(route('timesheets.index'));
        $this->assertDatabaseHas('timesheets', ['id' => $timesheet->id, 'status' => 'approved']);
    }

    public function test_employee_can_view_own_timesheets()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('timesheets.index'));

        $response->assertStatus(200);
    }
}
