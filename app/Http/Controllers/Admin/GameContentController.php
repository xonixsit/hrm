<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ObjectionCard;
use App\Models\ResponseCard;
use App\Models\TriviaQuestion;
use App\Models\TriviaOption;
use App\Services\GameContentGeneratorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameContentController extends Controller
{
    public function __construct(
        private GameContentGeneratorService $generator
    ) {}

    // Objection Crusher Management
    public function objectionIndex()
    {
        $objections = ObjectionCard::with('responses')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'total' => ObjectionCard::count(),
            'active' => ObjectionCard::where('active', true)->count(),
            'categories' => ObjectionCard::select('category')
                ->distinct()
                ->pluck('category')
                ->filter()
                ->values()
        ];

        return Inertia::render('Admin/Games/ObjectionCrusher/Index', [
            'objections' => $objections,
            'stats' => $stats
        ]);
    }

    public function generateObjections(Request $request)
    {
        $validated = $request->validate([
            'topic' => 'required|string|max:255',
            'difficulty' => 'required|in:easy,medium,hard',
            'count' => 'required|integer|min:1|max:50'
        ]);

        try {
            $generated = $this->generator->generateObjectionPairs(
                $validated['topic'],
                $validated['difficulty'],
                $validated['count']
            );

            return response()->json([
                'success' => true,
                'data' => $generated
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeObjections(Request $request)
    {
        $validated = $request->validate([
            'pairs' => 'required|array',
            'pairs.*.objection' => 'required|string',
            'pairs.*.response' => 'required|string',
            'pairs.*.category' => 'nullable|string',
            'pairs.*.difficulty' => 'required|in:easy,medium,hard',
            'pairs.*.tips' => 'nullable|string'
        ]);

        $created = [];

        foreach ($validated['pairs'] as $pair) {
            $objection = ObjectionCard::create([
                'objection_text' => $pair['objection'],
                'category' => $pair['category'] ?? null,
                'difficulty' => $pair['difficulty'],
                'tips' => $pair['tips'] ?? null,
                'active' => true
            ]);

            ResponseCard::create([
                'objection_id' => $objection->id,
                'response_text' => $pair['response'],
                'is_correct' => true
            ]);

            $created[] = $objection->load('responses');
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' objection pairs created successfully',
            'data' => $created
        ]);
    }

    public function updateObjection(Request $request, ObjectionCard $objection)
    {
        $validated = $request->validate([
            'objection_text' => 'required|string',
            'category' => 'nullable|string',
            'difficulty' => 'required|in:easy,medium,hard',
            'tips' => 'nullable|string',
            'active' => 'boolean'
        ]);

        $objection->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Objection updated successfully',
            'data' => $objection->load('responses')
        ]);
    }

    public function deleteObjection(ObjectionCard $objection)
    {
        $objection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Objection deleted successfully'
        ]);
    }

    // Tax Trivia Management
    public function triviaIndex()
    {
        $questions = TriviaQuestion::with('options')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'total' => TriviaQuestion::count(),
            'active' => TriviaQuestion::where('active', true)->count(),
            'categories' => TriviaQuestion::select('category')
                ->distinct()
                ->pluck('category')
                ->filter()
                ->values()
        ];

        return Inertia::render('Admin/Games/TaxTrivia/Index', [
            'questions' => $questions,
            'stats' => $stats
        ]);
    }

    public function generateTrivia(Request $request)
    {
        $validated = $request->validate([
            'topic' => 'required|string|max:255',
            'difficulty' => 'required|in:easy,medium,hard',
            'count' => 'required|integer|min:1|max:50'
        ]);

        try {
            $generated = $this->generator->generateTriviaQuestions(
                $validated['topic'],
                $validated['difficulty'],
                $validated['count']
            );

            return response()->json([
                'success' => true,
                'data' => $generated
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeTrivia(Request $request)
    {
        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.question' => 'required|string',
            'questions.*.options' => 'required|array|min:2|max:6',
            'questions.*.options.*.text' => 'required|string',
            'questions.*.options.*.is_correct' => 'required|boolean',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.category' => 'nullable|string',
            'questions.*.difficulty' => 'required|in:easy,medium,hard',
            'questions.*.source' => 'nullable|string'
        ]);

        $created = [];

        foreach ($validated['questions'] as $questionData) {
            $question = TriviaQuestion::create([
                'question_text' => $questionData['question'],
                'category' => $questionData['category'] ?? null,
                'difficulty' => $questionData['difficulty'],
                'explanation' => $questionData['explanation'] ?? null,
                'source' => $questionData['source'] ?? null,
                'active' => true
            ]);

            foreach ($questionData['options'] as $optionData) {
                TriviaOption::create([
                    'question_id' => $question->id,
                    'option_text' => $optionData['text'],
                    'is_correct' => $optionData['is_correct']
                ]);
            }

            $created[] = $question->load('options');
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' questions created successfully',
            'data' => $created
        ]);
    }

    public function updateTrivia(Request $request, TriviaQuestion $question)
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'category' => 'nullable|string',
            'difficulty' => 'required|in:easy,medium,hard',
            'explanation' => 'nullable|string',
            'source' => 'nullable|string',
            'active' => 'boolean'
        ]);

        $question->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully',
            'data' => $question->load('options')
        ]);
    }

    public function deleteTrivia(TriviaQuestion $question)
    {
        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully'
        ]);
    }
}
