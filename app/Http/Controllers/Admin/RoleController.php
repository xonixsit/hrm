<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        // Only admins can manage roles
        $this->authorize('viewAny', Role::class);
        
        $users = User::with(['roles', 'employee'])
            ->whereHas('employee') // Only show users with employee records
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'employee_code' => $user->employee->employee_code ?? 'N/A',
                    'job_title' => $user->employee->job_title ?? 'N/A',
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'status' => $user->employee->status ?? 'inactive',
                ];
            });

        $roles = Role::all()->pluck('name');

        return Inertia::render('Admin/Roles/Index', [
            'users' => $users,
            'availableRoles' => $roles,
        ]);
    }

    public function assignRole(Request $request, User $user)
    {
        // Only admins can assign roles
        $this->authorize('update', Role::class);
        
        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $role = $request->role;
        
        // Prevent removing admin role from the last admin
        if ($user->hasRole('Admin') && $role !== 'Admin') {
            $adminCount = User::role('Admin')->count();
            if ($adminCount <= 1) {
                return back()->withErrors([
                    'role' => 'Cannot remove Admin role from the last administrator.'
                ]);
            }
        }

        // Remove all existing roles and assign the new one
        $user->syncRoles([$role]);

        return back()->with('success', "Role '{$role}' assigned to {$user->name} successfully.");
    }

    public function removeRole(Request $request, User $user)
    {
        // Only admins can remove roles
        $this->authorize('update', Role::class);
        
        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $role = $request->role;
        
        // Prevent removing admin role from the last admin
        if ($role === 'Admin') {
            $adminCount = User::role('Admin')->count();
            if ($adminCount <= 1) {
                return back()->withErrors([
                    'role' => 'Cannot remove Admin role from the last administrator.'
                ]);
            }
        }

        $user->removeRole($role);

        return back()->with('success', "Role '{$role}' removed from {$user->name} successfully.");
    }
}