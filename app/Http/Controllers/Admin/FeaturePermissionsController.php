<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\FeatureRolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class FeaturePermissionsController extends Controller
{
    /**
     * Show the feature permissions matrix.
     * Rows = features, Columns = non-Admin roles.
     */
    public function index()
    {
        $features = Feature::with('rolePermissions')
            ->orderBy('group')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($f) => [
                'id'           => $f->id,
                'key'          => $f->key,
                'label'        => $f->label,
                'group'        => $f->group,
                'allowed_roles' => $f->rolePermissions->pluck('role_name')->toArray(),
            ]);

        // All roles except Admin (Admin bypasses the system)
        $roles = Role::whereNotIn('name', ['Admin'])
            ->orderBy('name')
            ->pluck('name');

        return Inertia::render('Admin/FeaturePermissions/Index', [
            'features' => $features,
            'roles'    => $roles,
        ]);
    }

    /**
     * Save the full permission matrix sent from the frontend.
     *
     * Expects: { permissions: { feature_id: [role_name, ...] } }
     */
    public function save(Request $request)
    {
        $request->validate([
            'permissions'   => 'required|array',
            'permissions.*' => 'array',
        ]);

        foreach ($request->permissions as $featureId => $roles) {
            $feature = Feature::findOrFail($featureId);

            // Delete all existing role entries for this feature
            FeatureRolePermission::where('feature_id', $feature->id)->delete();

            // Re-insert checked roles
            foreach ($roles as $role) {
                FeatureRolePermission::create([
                    'feature_id' => $feature->id,
                    'role_name'  => $role,
                ]);
            }
        }

        // Bust all feature caches so changes take effect immediately
        $this->bustFeatureCache();

        return back()->with('success', 'Feature permissions saved successfully.');
    }

    /**
     * Toggle a single feature/role pair (used for individual checkbox AJAX).
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'feature_id' => 'required|exists:features,id',
            'role_name'  => 'required|string',
            'enabled'    => 'required|boolean',
        ]);

        if ($request->enabled) {
            FeatureRolePermission::firstOrCreate([
                'feature_id' => $request->feature_id,
                'role_name'  => $request->role_name,
            ]);
        } else {
            FeatureRolePermission::where('feature_id', $request->feature_id)
                ->where('role_name', $request->role_name)
                ->delete();
        }

        $this->bustFeatureCache();

        return response()->json(['ok' => true]);
    }

    private function bustFeatureCache(): void
    {
        // Bust per-role caches and the all-keys cache
        $roles = Role::pluck('name')->toArray();
        foreach ($roles as $role) {
            Cache::forget("feature_roles:{$role}");
        }
        Cache::forget('features:all_keys');

        // Bust the combined role-set caches used by HandleInertiaRequests
        $roleSubsets = $this->generateRoleSubsets($roles);
        foreach ($roleSubsets as $subset) {
            $key = 'features:roles:' . implode('_', $subset);
            Cache::forget($key);
        }

        // Also bust per-feature-key caches used by the middleware
        $featureKeys = Feature::pluck('key')->toArray();
        foreach ($featureKeys as $key) {
            Cache::forget("feature_roles:{$key}");
        }
    }

    /**
     * Generate all non-empty subsets of roles to cover every possible cache key.
     */
    private function generateRoleSubsets(array $roles): array
    {
        $subsets = [];
        $count = count($roles);
        for ($i = 1; $i < (1 << $count); $i++) {
            $subset = [];
            for ($j = 0; $j < $count; $j++) {
                if ($i & (1 << $j)) {
                    $subset[] = $roles[$j];
                }
            }
            $subsets[] = $subset;
        }
        return $subsets;
    }
}
