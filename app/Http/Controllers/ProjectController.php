<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Traits\AuditLogTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $projects = Project::paginate(10);
        return Inertia::render('Projects/Index', ['projects' => $projects]);
    }

    public function create()
    {
        return Inertia::render('Projects/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Project::create($validated);

        $this->logAudit('Project Created', 'Created project: ' . $validated['name']);
        return redirect()->route('projects.index')->with('success', 'Project created successfully.');
    }

    public function show(Project $project)
    {
        return Inertia::render('Projects/Show', ['project' => $project]);
    }

    public function edit(Project $project)
    {
        return Inertia::render('Projects/Edit', ['project' => $project]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project->update($validated);

        $this->logAudit('Project Updated', 'Updated project: ' . $project->name);
        return redirect()->route('projects.index')->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        $this->logAudit('Project Deleted', 'Deleted project: ' . $project->name);
        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
