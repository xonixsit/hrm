<?php

namespace App\Http\Controllers;

use App\Models\Timesheet;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;
use App\Notifications\TimesheetApprovedNotification;
use App\Notifications\TimesheetRejectedNotification;

class TimesheetController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('Admin') || $user->hasRole('Manager')) {
            $timesheets = Timesheet::with(['employee.user', 'project', 'task'])->paginate(10);
        } else {
            $employee = $user->employee;
            $timesheets = Timesheet::where('employee_id', $employee->id)->with(['project', 'task'])->paginate(10);
        }
        return Inertia::render('Timesheets/Index', ['timesheets' => $timesheets]);
    }

    public function create()
    {
        $projects = Project::all();
        $tasks = Task::all();
        return Inertia::render('Timesheets/Create', ['projects' => $projects, 'tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $validated['employee_id'] = Auth::user()->employee->id;
        $validated['status'] = 'pending';

        Timesheet::create($validated);

        $this->logAudit('Timesheet Created', 'Created timesheet for date: ' . $validated['date']);
        return redirect()->route('timesheets.index')->with('success', 'Timesheet entry created.');
    }

    public function show(Timesheet $timesheet)
    {
        $timesheet->load(['employee.user', 'project', 'task']);
        return Inertia::render('Timesheets/Show', ['timesheet' => $timesheet]);
    }

    public function edit(Timesheet $timesheet)
    {
        $projects = Project::all();
        $tasks = Task::all();
        return Inertia::render('Timesheets/Edit', ['timesheet' => $timesheet, 'projects' => $projects, 'tasks' => $tasks]);
    }

    public function update(Request $request, Timesheet $timesheet)
    {
        $this->authorize('update', $timesheet);

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        $timesheet->update($validated);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'approved') {
                $timesheet->employee->user->notify(new TimesheetApprovedNotification($timesheet));
            } elseif ($validated['status'] === 'rejected') {
                $timesheet->employee->user->notify(new TimesheetRejectedNotification($timesheet));
            }
        }

        $this->logAudit('Timesheet Updated', 'Updated timesheet ID: ' . $timesheet->id);
        return redirect()->route('timesheets.index')->with('success', 'Timesheet updated.');
    }

    public function destroy(Timesheet $timesheet)
    {
        $this->authorize('delete', $timesheet);

        $timesheet->delete();

        $this->logAudit('Timesheet Deleted', 'Deleted timesheet ID: ' . $timesheet->id);
        return redirect()->route('timesheets.index')->with('success', 'Timesheet deleted.');
    }
}
