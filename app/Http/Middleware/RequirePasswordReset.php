<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RequirePasswordReset
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && Auth::user()->password_reset_required) {
            // Allow access to password reset routes
            if ($request->routeIs('password.*') || $request->routeIs('profile.*') || $request->routeIs('logout')) {
                return $next($request);
            }
            
            // Redirect to password reset page
            return redirect()->route('profile.edit')->with('message', 'Please change your password to continue.');
        }

        return $next($request);
    }
}