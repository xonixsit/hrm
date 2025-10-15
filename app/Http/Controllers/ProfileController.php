<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $employee = $user->employee;
        
        // Load relationships if employee exists
        if ($employee) {
            $employee->load('department', 'manager');
            
            // Ensure date_of_birth is in the correct format for HTML date input
            if ($employee->date_of_birth) {
                $employee->date_of_birth_formatted = $employee->date_of_birth->format('Y-m-d');
            }
        }
        
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'employee' => $employee,
            'user' => $user,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Account settings updated successfully.');
    }

    /**
     * Update the user's employee profile information.
     */
    public function updateEmployee(Request $request): RedirectResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return Redirect::route('profile.edit')->with('error', 'Employee profile not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'phone' => 'nullable|string|max:20',
            'personal_email' => 'nullable|email|max:255',
            'nationality' => 'nullable|string|max:100',
            'work_location' => 'nullable|string|max:255',
            'current_address' => 'nullable|string|max:500',
            'permanent_address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_email' => 'nullable|email|max:255',
            'skills' => 'nullable|string',
            'education' => 'nullable|string',
        ]);

        // Update user name
        $user->update(['name' => $validated['name']]);

        // Update employee information
        $employee->update([
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'phone' => $validated['phone'],
            'personal_email' => $validated['personal_email'],
            'nationality' => $validated['nationality'],
            'work_location' => $validated['work_location'],
            'current_address' => $validated['current_address'],
            'permanent_address' => $validated['permanent_address'],
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_relationship' => $validated['emergency_contact_relationship'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'emergency_contact_email' => $validated['emergency_contact_email'],
            'skills' => $validated['skills'],
            'education' => $validated['education'],
        ]);

        // Refresh the employee data to ensure we have the latest information
        $employee->refresh();
        
        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }


}
