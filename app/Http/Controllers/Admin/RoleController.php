<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /** Roles that ship with the app and cannot be deleted or renamed. */
    const SYSTEM_ROLES = ['Admin', 'HR', 'Manager', 'Employee'];

    // ─── Index ────────────────────────────────────────────────────────────────

    public function index()
    {
        $this->authorize('viewAny', Role::class);

        $users = User::with(['roles', 'employee'])
            ->whereHas('employee')
            ->get()
            ->map(fn($user) => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'employee_code' => $user->employee->employee_code ?? 'N/A',
                'job_title'     => $user->employee->job_title    ?? 'N/A',
                'roles'         => $user->roles->pluck('name')->toArray(),
                'status'        => $user->employee->status       ?? 'inactive',
            ]);

        $roles = Role::orderBy('name')->get()->map(fn($r) => [
            'name'      => $r->name,
            'is_system' => in_array($r->name, self::SYSTEM_ROLES),
        ]);

        return Inertia::render('Admin/Roles/Index', [
            'users'         => $users,
            'availableRoles'=> $roles,
            'currentUserId' => auth()->id(),
        ]);
    }

    // ─── Create role ──────────────────────────────────────────────────────────

    public function createRole(Request $request)
    {
        $this->authorize('create', Role::class);

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Za-z0-9 _-]+$/',
                'unique:roles,name',
            ],
        ], [
            'name.regex'  => 'Role name may only contain letters, numbers, spaces, hyphens and underscores.',
            'name.unique' => 'A role with that name already exists.',
        ]);

        $name = trim($request->name);

        // Use raw insert to avoid schema introspection on older MySQL (< 5.7.6)
        // which doesn't support the generation_expression column in information_schema.
        DB::table('roles')->insert([
            'name'       => $name,
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Bust feature permission caches so the new role appears in the matrix
        $this->bustFeatureCache();

        return back()->with('success', "Role '{$name}' created successfully.");
    }

    // ─── Rename role ──────────────────────────────────────────────────────────

    public function renameRole(Request $request, string $roleName)
    {
        $this->authorize('update', Role::class);

        $role = Role::where('name', $roleName)->firstOrFail();

        if (in_array($role->name, self::SYSTEM_ROLES)) {
            return back()->withErrors(['name' => 'System roles cannot be renamed.']);
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Za-z0-9 _-]+$/',
                'unique:roles,name,' . $role->id,
            ],
        ]);

        $old = $role->name;
        $new = trim($request->name);

        // Update feature_role_permissions rows that reference the old name
        DB::table('feature_role_permissions')
            ->where('role_name', $old)
            ->update(['role_name' => $new]);

        // Raw update to avoid schema introspection on older MySQL
        DB::table('roles')->where('id', $role->id)->update([
            'name'       => $new,
            'updated_at' => now(),
        ]);

        $this->bustFeatureCache();

        return back()->with('success', "Role renamed from '{$old}' to '{$new}'.");
    }

    // ─── Delete role ──────────────────────────────────────────────────────────

    public function deleteRole(string $roleName)
    {
        $this->authorize('delete', Role::class);

        $role = Role::where('name', $roleName)->firstOrFail();

        if (in_array($role->name, self::SYSTEM_ROLES)) {
            return back()->withErrors(['role' => "The '{$role->name}' role is a system role and cannot be deleted."]);
        }

        // Reassign any users that only have this role → give them Employee
        $usersOnlyThisRole = User::whereHas('roles', fn($q) => $q->where('name', $role->name))
            ->get()
            ->filter(fn($u) => $u->roles->count() === 1);

        foreach ($usersOnlyThisRole as $user) {
            $user->syncRoles(['Employee']);
        }

        // Remove from feature permissions
        DB::table('feature_role_permissions')->where('role_name', $role->name)->delete();

        // Raw delete to avoid schema introspection on older MySQL
        DB::table('roles')->where('id', $role->id)->delete();

        // Clear Spatie's permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $this->bustFeatureCache();

        return back()->with('success', "Role '{$role->name}' deleted. Affected users were moved to Employee.");
    }

    // ─── Assign role to user ──────────────────────────────────────────────────

    public function assignRole(Request $request, User $user)
    {
        $this->authorize('update', Role::class);

        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $role        = $request->role;
        $currentUser = auth()->user();

        if ($user->id === $currentUser->id && $user->hasRole('Admin') && $role !== 'Admin') {
            return back()->withErrors(['role' => 'You cannot remove your own Admin role.']);
        }

        if ($user->hasRole('Admin') && $role !== 'Admin') {
            abort_if(User::role('Admin')->count() <= 1, 422, 'Cannot remove Admin role from the last administrator.');
        }

        $user->syncRoles([$role]);

        return back()->with('success', "Role '{$role}' assigned to {$user->name} successfully.");
    }

    // ─── Remove role from user ────────────────────────────────────────────────

    public function removeRole(Request $request, User $user)
    {
        $this->authorize('update', Role::class);

        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $role        = $request->role;
        $currentUser = auth()->user();

        if ($user->id === $currentUser->id && $role === 'Admin') {
            return back()->withErrors(['role' => 'You cannot remove your own Admin role.']);
        }

        if ($role === 'Admin') {
            abort_if(User::role('Admin')->count() <= 1, 422, 'Cannot remove Admin role from the last administrator.');
        }

        if ($role === 'Employee' && $user->roles->count() === 1) {
            return back()->withErrors(['role' => 'Cannot remove Employee role — it is the default role for all users.']);
        }

        $user->removeRole($role);

        return back()->with('success', "Role '{$role}' removed from {$user->name} successfully.");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function bustFeatureCache(): void
    {
        Cache::forget('features:all_keys');

        // Bust every role-set cache (brute-force clear all feature:roles:* keys)
        $roles = Role::pluck('name')->toArray();
        foreach ($roles as $role) {
            Cache::forget("feature_roles:{$role}");
        }

        // Bust combined role-set keys used by HandleInertiaRequests
        $count = count($roles);
        for ($i = 1; $i < (1 << $count); $i++) {
            $subset = [];
            for ($j = 0; $j < $count; $j++) {
                if ($i & (1 << $j)) $subset[] = $roles[$j];
            }
            Cache::forget('features:roles:' . implode('_', $subset));
        }

        // Bust per-feature-key middleware caches
        Feature::pluck('key')->each(fn($k) => Cache::forget("feature_roles:{$k}"));
    }
}
