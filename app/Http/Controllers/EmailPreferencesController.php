<?php

namespace App\Http\Controllers;

use App\Models\EmailPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailPreferencesController extends Controller
{
    public function show()
    {
        $preferences = auth()->user()->getEmailPreferences();
        
        return Inertia::render('EmailPreferences/Show', [
            'preferences' => $preferences,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'leave_request_submitted' => 'boolean',
            'leave_request_approved' => 'boolean',
            'leave_request_rejected' => 'boolean',
            'assessment_assigned' => 'boolean',
            'assessment_submitted' => 'boolean',
            'assessment_approved' => 'boolean',
            'assessment_rejected' => 'boolean',
            'daily_digest' => 'boolean',
            'weekly_digest' => 'boolean',
            'digest_time' => ['string', 'regex:/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/'],
            'digest_day' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'pending_reminders' => 'boolean',
            'reminder_frequency_hours' => 'integer|min:1|max:168',
            'system_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
            'birthday_notifications' => 'boolean',
            'birthday_reminders' => 'boolean',
            'birthday_reminder_days' => 'integer|min:1|max:7',
        ]);

        $preferences = auth()->user()->getEmailPreferences();
        $preferences->update($validated);

        return back()->with('success', 'Email preferences updated successfully!');
    }
}