<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Events\UserPresence;
use App\Models\User;

class TrackUserPresence
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (auth()->check()) {
            $user = auth()->user();
            
            // Broadcast user is online
            broadcast(new UserPresence($user, 'online'))->toOthers();
        }

        return $response;
    }
}
