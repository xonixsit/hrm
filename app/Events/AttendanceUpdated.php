<?php

namespace App\Events;

use App\Models\Employee;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $employee;
    public $attendanceData;

    /**
     * Create a new event instance.
     */
    public function __construct(Employee $employee, array $attendanceData)
    {
        $this->employee = $employee;
        $this->attendanceData = $attendanceData;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('attendance.' . $this->employee->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'attendance.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'employee_id' => $this->employee->id,
            'clocked_in' => $this->attendanceData['clocked_in'] ?? false,
            'on_break' => $this->attendanceData['on_break'] ?? false,
            'clock_in_time' => $this->attendanceData['clock_in_time'] ?? null,
            'current_break_start' => $this->attendanceData['current_break_start'] ?? null,
            'break_sessions' => $this->attendanceData['break_sessions'] ?? [],
            'todays_summary' => $this->attendanceData['todays_summary'] ?? [
                'total_hours' => '0h 0m',
                'break_time' => '0h 0m'
            ],
            'timestamp' => now()->toISOString(),
            'action' => $this->attendanceData['action'] ?? 'update'
        ];
    }
}