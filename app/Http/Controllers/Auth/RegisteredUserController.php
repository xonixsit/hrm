<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],

        ]);

        DB::transaction(function () use ($request) {
            // Create the user account
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Create the employee record
            // Generate a simple employee code (e.g., EMP-timestamp)
            $employeeCode = 'EMP-' . now()->timestamp;

            Employee::create([
                'user_id' => $user->id,
                'employee_code' => $employeeCode,
                'join_date' => now()->toDateString(),
                'contract_type' => 'Full-time', // Default contract type
                'status' => 'Active',
                'department_id' => 1, // Default department_id
                'job_title' => 'Employee', // Default job_title
            ]);

            event(new Registered($user));

            Auth::login($user);
        });

        return redirect(route('login', absolute: false));
    }
}
