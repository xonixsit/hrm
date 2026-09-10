<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RequireFeatureAccess
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:  ->middleware('feature:attendance')
     *
     * Admin role always bypasses this check.
     * Cache TTL: 5 minutes — busted when admin saves permissions.
     */
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        $user = Auth::user();

        if (!$user) {
            abort(401);
        }

        // Admin always has full access — never restricted by feature permissions
        if ($user->hasRole('Admin')) {
            return $next($request);
        }

        $allowedRoles = Cache::remember("feature_roles:{$featureKey}", 300, function () use ($featureKey) {
            return DB::table('feature_role_permissions')
                ->join('features', 'features.id', '=', 'feature_role_permissions.feature_id')
                ->where('features.key', $featureKey)
                ->pluck('feature_role_permissions.role_name')
                ->toArray();
        });

        abort_unless($user->hasAnyRole($allowedRoles), 403, 'You do not have access to this feature.');

        return $next($request);
    }
}
