<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaValidationErrors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (ValidationException $e) {
            // If this is an Inertia request, redirect back with errors
            if ($request->header('X-Inertia')) {
                return redirect()->back()
                    ->withErrors($e->errors())
                    ->withInput($request->input());
            }
            
            // Otherwise, let the exception bubble up
            throw $e;
        }
    }
}