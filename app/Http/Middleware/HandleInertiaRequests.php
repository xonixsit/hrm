<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->load('employee')->toArray(), [
                    'roles'            => $request->user()->getRoleNames()->values()->toArray(),
                    'is_admin'         => $request->user()->hasRole('Admin'),
                    'allowed_features' => $this->getAllowedFeatures($request),
                ]) : null,
            ],
            'csrf_token' => csrf_token(),
            'app_timezone' => config('app.timezone', 'UTC'),
        ];
    }

    /**
     * Resolve which feature keys the current user can access.
     * Admins get every feature key. Others get what their roles allow.
     */
    private function getAllowedFeatures(Request $request): array
    {
        $user = $request->user();

        if (!$user) {
            return [];
        }

        // Admin bypasses feature restrictions — always sees everything
        if ($user->hasRole('Admin')) {
            return Cache::remember('features:all_keys', 300, function () {
                return DB::table('features')->pluck('key')->toArray();
            });
        }

        $roles = $user->getRoleNames()->toArray();

        // Build a unique cache key per role combination so different role sets
        // don't interfere with each other.
        $cacheKey = 'features:roles:' . implode('_', $roles);

        return Cache::remember($cacheKey, 300, function () use ($roles) {
            return DB::table('feature_role_permissions')
                ->join('features', 'features.id', '=', 'feature_role_permissions.feature_id')
                ->whereIn('feature_role_permissions.role_name', $roles)
                ->pluck('features.key')
                ->unique()
                ->values()
                ->toArray();
        });
    }
}
