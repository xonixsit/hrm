<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_clock_in()
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $this->actingAs($user);

        $response = $this->post(route('attendances.clockIn'));

        $response->assertRedirect();
        $this->assertDatabaseHas('attendances', ['employee_id' => $employee->id, 'clock_in' => now()->format('Y-m-d H:i:s')]);
    }

    public function test_employee_can_clock_out()
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $attendance = Attendance::factory()->create(['employee_id' => $employee->id, 'clock_in' => now()->subHours(1), 'clock_out' => null]);
        $this->actingAs($user);

        $response = $this->post(route('attendances.clockOut'));

        $response->assertRedirect();
        $this->assertDatabaseHas('attendances', ['id' => $attendance->id, 'clock_out' => now()->format('Y-m-d H:i:s')]);
    }

    public function test_admin_can_view_attendances()
    {
        $admin = User::factory()->create()->assignRole('Admin');
        $this->actingAs($admin);

        $response = $this->get(route('attendances.index'));

        $response->assertStatus(200);
    }
}
