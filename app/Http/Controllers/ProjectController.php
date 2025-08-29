<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Employee;
use App\Models\User;
use App\Traits\AuditLogTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProjectController extends Controller
{
    use AuditLogTrait;

    public function index(Request $request)
    {
        $query = Project::with(['manager.user', 'teamMembers.user'])
            ->withCount(['tasks', 'teamMembers']);

        // Apply search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('client', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('manager_id')) {
            $query->where('manager_id', $request->manager_id);
        }

        if ($request->filled('due_before')) {
            $query->where('due_date', '<=', $request->due_before);
        }

        // Apply sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $projects = $query->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform data for frontend
        $projects->getCollection()->transform(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'client' => $project->client,
                'status' => $project->status,
                'priority' => $project->priority,
                'budget' => $project->budget,
                'progress' => $project->progress,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'due_date' => $project->due_date?->format('Y-m-d'),
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
                'manager' => $project->manager ? [
                    'id' => $project->manager->id,
                    'name' => $project->manager->user->name,
                    'avatar' => null, // Add avatar logic if needed
                ] : null,
                'team_members' => $project->teamMembers->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->user->name,
                        'avatar' => null, // Add avatar logic if needed
                        'role' => $member->pivot->role ?? 'Team Member',
                    ];
                }),
                'tasks_count' => $project->tasks_count,
                'team_members_count' => $project->team_members_count,
            ];
        });

        // Get managers for filter dropdown
        $managers = Employee::with('user')
            ->whereHas('user.roles', function ($query) {
                $query->whereIn('name', ['Admin', 'Manager']);
            })
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                ];
            });

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'managers' => $managers,
            'filters' => $request->only(['search', 'status', 'priority', 'manager_id', 'due_before'])
        ]);
    }

    public function create()
    {
        $users = User::with('employee')->whereHas('employee')->get()
            ->map(function ($user) {
                return [
                    'id' => $user->employee->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            });

        $managers = Employee::with('user')
            ->whereHas('user.roles', function ($query) {
                $query->whereIn('name', ['Admin', 'Manager']);
            })
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                    'email' => $employee->user->email,
                ];
            });

        return Inertia::render('Projects/Create', [
            'users' => $users,
            'managers' => $managers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client' => 'nullable|string|max:255',
            'status' => 'required|in:planning,active,on_hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'budget' => 'nullable|numeric|min:0',
            'progress' => 'nullable|integer|min:0|max:100',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'manager_id' => 'nullable|exists:employees,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:employees,id',
        ]);

        DB::transaction(function () use ($validated) {
            $project = Project::create($validated);

            // Attach team members
            if (!empty($validated['team_members'])) {
                $project->teamMembers()->attach($validated['team_members']);
            }

            $this->logAudit('Project Created', 'Created project: ' . $validated['name']);
        });

        return redirect()->route('projects.index')
            ->with('success', 'Project created successfully.');
    }

    public function show(Project $project)
    {
        $project->load([
            'manager.user',
            'teamMembers.user'
        ]);

        // Get latest tasks separately to avoid MariaDB window function issues
        $latestTasks = $project->tasks()->latest()->limit(10)->get();

        // Transform data for frontend
        $projectData = [
            'id' => $project->id,
            'name' => $project->name,
            'description' => $project->description,
            'client' => $project->client,
            'status' => $project->status,
            'priority' => $project->priority,
            'budget' => $project->budget,
            'progress' => $project->progress,
            'start_date' => $project->start_date?->format('Y-m-d'),
            'due_date' => $project->due_date?->format('Y-m-d'),
            'created_at' => $project->created_at,
            'updated_at' => $project->updated_at,
            'tasks_completed' => $project->tasks_completed,
            'tasks_total' => $project->tasks_total,
            'manager' => $project->manager ? [
                'id' => $project->manager->id,
                'name' => $project->manager->user->name,
                'email' => $project->manager->user->email,
                'avatar' => null,
            ] : null,
            'team_members' => $project->teamMembers->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'role' => $member->pivot->role ?? 'Team Member',
                    'avatar' => null,
                ];
            }),
            'tasks' => $latestTasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'name' => $task->name,
                    'description' => $task->description,
                    'status' => $task->status,
                    'created_at' => $task->created_at,
                    'updated_at' => $task->updated_at,
                ];
            }),
        ];

        return Inertia::render('Projects/Show', [
            'project' => $projectData
        ]);
    }

    public function edit(Project $project)
    {
        $project->load(['manager.user', 'teamMembers']);

        // Transform project data for frontend (same as show method)
        $projectData = [
            'id' => $project->id,
            'name' => $project->name,
            'description' => $project->description,
            'client' => $project->client,
            'status' => $project->status,
            'priority' => $project->priority,
            'budget' => $project->budget,
            'progress' => $project->progress,
            'start_date' => $project->start_date?->format('Y-m-d'),
            'due_date' => $project->due_date?->format('Y-m-d'),
            'created_at' => $project->created_at,
            'updated_at' => $project->updated_at,
            'manager_id' => $project->manager_id,
            'team_members' => $project->teamMembers->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'role' => $member->pivot->role ?? 'Team Member',
                ];
            }),
        ];

        $users = User::with('employee')->whereHas('employee')->get()
            ->map(function ($user) {
                return [
                    'id' => $user->employee->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            });

        $managers = Employee::with('user')
            ->whereHas('user.roles', function ($query) {
                $query->whereIn('name', ['Admin', 'Manager']);
            })
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                    'email' => $employee->user->email,
                ];
            });

        return Inertia::render('Projects/Edit', [
            'project' => $projectData,
            'users' => $users,
            'managers' => $managers
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client' => 'nullable|string|max:255',
            'status' => 'required|in:planning,active,on_hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'budget' => 'nullable|numeric|min:0',
            'progress' => 'nullable|integer|min:0|max:100',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'manager_id' => 'nullable|exists:employees,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:employees,id',
        ]);

        DB::transaction(function () use ($validated, $project) {
            $project->update($validated);

            // Sync team members
            if (array_key_exists('team_members', $validated)) {
                $project->teamMembers()->sync($validated['team_members'] ?? []);
            }

            $this->logAudit('Project Updated', 'Updated project: ' . $project->name);
        });

        return redirect()->route('projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $projectName = $project->name;
        
        DB::transaction(function () use ($project) {
            // Detach team members
            $project->teamMembers()->detach();
            
            // Delete the project
            $project->delete();
            
            $this->logAudit('Project Deleted', 'Deleted project: ' . $project->name);
        });

        return redirect()->route('projects.index')
            ->with('success', "Project \"{$projectName}\" deleted successfully.");
    }
}
