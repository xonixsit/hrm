<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Services\TaxGptService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxGptController extends Controller
{
    public function __construct(private TaxGptService $taxGptService) {}

    public function index(Request $request)
    {
        $sessions = ChatSession::where('user_id', $request->user()->id)
            ->withCount('messages')
            ->latest()
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'messages_count' => $s->messages_count,
                'updated_at' => $s->updated_at,
            ]);

        return Inertia::render('TaxGpt/Index', [
            'sessions' => $sessions,
            'activeSession' => null,
            'messages' => [],
        ]);
    }

    public function show(Request $request, ChatSession $chatSession)
    {
        if ($chatSession->user_id !== $request->user()->id) {
            abort(403);
        }

        $sessions = ChatSession::where('user_id', $request->user()->id)
            ->withCount('messages')
            ->latest()
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'messages_count' => $s->messages_count,
                'updated_at' => $s->updated_at,
            ]);

        $messages = $chatSession->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'role' => $m->role,
                'content' => $m->content,
                'created_at' => $m->created_at,
            ]);

        return Inertia::render('TaxGpt/Index', [
            'sessions' => $sessions,
            'activeSession' => [
                'id' => $chatSession->id,
                'title' => $chatSession->title,
            ],
            'messages' => $messages,
        ]);
    }

    public function newSession(Request $request)
    {
        $session = ChatSession::create([
            'user_id' => $request->user()->id,
            'title' => 'New Chat',
        ]);

        return redirect()->route('taxgpt.show', $session->id);
    }

    public function sendMessage(Request $request, ChatSession $chatSession)
    {
        if ($chatSession->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate(['message' => 'required|string|max:2000']);

        try {
            $reply = $this->taxGptService->chat($chatSession, $request->message);

            return response()->json([
                'reply' => $reply,
                'session_title' => $chatSession->fresh()->title,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function streamMessage(Request $request, ChatSession $chatSession)
    {
        if ($chatSession->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate(['message' => 'required|string|max:2000']);

        $message = $request->input('message');

        return response()->stream(function () use ($chatSession, $message) {
            try {
                $this->taxGptService->stream($chatSession, $message, function (string $token) {
                    echo 'data: ' . json_encode(['token' => $token]) . "\n\n";
                    ob_flush();
                    flush();
                });

                $title = $chatSession->fresh()->title;
                echo 'data: ' . json_encode(['done' => true, 'session_title' => $title]) . "\n\n";
                ob_flush();
                flush();
            } catch (\Exception $e) {
                echo 'data: ' . json_encode(['error' => $e->getMessage()]) . "\n\n";
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    public function deleteSession(Request $request, ChatSession $chatSession)
    {
        if ($chatSession->user_id !== $request->user()->id) {
            abort(403);
        }

        $chatSession->delete();

        return redirect()->route('taxgpt.index');
    }
}
