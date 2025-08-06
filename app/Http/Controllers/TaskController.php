<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class TaskController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $tasks = Task::with('project')->paginate(10);
        return Inertia::render('Tasks/Index', ['tasks' => $tasks]);
    }

    public function create()
    {
        $projects = Project::all();
        return Inertia::render('Tasks/Create', ['projects' => $projects]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Task::create($validated);

        $this->logAudit('Task Created', 'Created task: ' . $validated['name']);
        return redirect()->route('tasks.index')->with('success', 'Task created successfully.');
    }

    public function show(Task $task)
    {
        $task->load('project');
        return Inertia::render('Tasks/Show', ['task' => $task]);
    }

    public function edit(Task $task)
    {
        $projects = Project::all();
        return Inertia::render('Tasks/Edit', ['task' => $task, 'projects' => $projects]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $task->update($validated);

        $this->logAudit('Task Updated', 'Updated task: ' . $task->name);
        return redirect()->route('tasks.index')->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        $this->logAudit('Task Deleted', 'Deleted task: ' . $task->name);
        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully.');
    }
}
