<?php

namespace App\Http\Controllers;

use App\Mail\SupportRequestMail;
use App\Models\SupportRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function create()
    {
        return Inertia::render('Support/Create', [
            'categories' => SupportRequest::getCategories(),
            'priorities' => SupportRequest::getPriorities(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:' . implode(',', array_keys(SupportRequest::getCategories())),
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'priority' => 'required|string|in:' . implode(',', array_keys(SupportRequest::getPriorities())),
        ]);

        $supportRequest = SupportRequest::create([
            'user_id' => auth()->id(),
            'category' => $validated['category'],
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        // Send email notification
        $supportEmail = config('mail.support_email', config('mail.from.address'));
        Mail::to($supportEmail)->send(new SupportRequestMail($supportRequest));

        return redirect()->back()->with('success', 'Support request submitted successfully! We will get back to you soon.');
    }

    public function index()
    {
        $supportRequests = SupportRequest::with('user')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Support/Index', [
            'supportRequests' => $supportRequests,
            'categories' => SupportRequest::getCategories(),
            'priorities' => SupportRequest::getPriorities(),
            'statuses' => SupportRequest::getStatuses(),
        ]);
    }

    public function show(SupportRequest $supportRequest)
    {
        // Ensure user can only view their own support requests
        if ($supportRequest->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Support/Show', [
            'supportRequest' => $supportRequest->load('user'),
            'categories' => SupportRequest::getCategories(),
            'priorities' => SupportRequest::getPriorities(),
            'statuses' => SupportRequest::getStatuses(),
        ]);
    }
}
