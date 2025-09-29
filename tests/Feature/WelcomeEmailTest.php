<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Notifications\WelcomeEmployeeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class WelcomeEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_email_is_sent_when_employee_is_created()
    {
        // Arrange
        Notification::fake();
        
        $department = Department::factory()->create();
        
        // Act
        $response = $this->post('/employees', [
            'name' => 'Test Employee',
            'email' => 'test.employee@example.com',
            'password' => 'password123',
            'department_id' => $department->id,
            'job_title' => 'Test Position',
            'employee_code' => 'TEST123',
            'join_date' => now()->format('Y-m-d'),
            'contract_type' => 'Full-time',
        ]);

        // Assert
        $user = User::where('email', 'test.employee@example.com')->first();
        $this->assertNotNull($user);
        
        Notification::assertSentTo(
            $user,
            WelcomeEmployeeNotification::class,
            function ($notification, $channels) use ($user) {
                return in_array('mail', $channels);
            }
        );
    }
}