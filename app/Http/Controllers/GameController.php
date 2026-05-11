<?php

namespace App\Http\Controllers;

use App\Models\ObjectionCard;
use App\Models\ResponseCard;
use App\Models\TriviaQuestion;
use App\Models\ObjectionGameSession;
use App\Models\TriviaGameSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    // Objection Crusher Game
    public function objectionCrusherIndex()
    {
        $employee = auth()->user()->employee;
        
        $stats = [
            'games_played' => ObjectionGameSession::where('employee_id', $employee->id)->count(),
            'best_score' => ObjectionGameSession::where('employee_id', $employee->id)->max('score') ?? 0,
            'total_score' => ObjectionGameSession::where('employee_id', $employee->id)->sum('score'),
            'accuracy' => $this->calculateAccuracy($employee->id, 'objection')
        ];

        return Inertia::render('Games/ObjectionCrusher/Play', [
            'stats' => $stats
        ]);
    }

    public function getObjectionCards(Request $request)
    {
        $difficulty = $request->input('difficulty', 'medium');
        $count = $request->input('count', 10);

        // Get random objections with their correct responses
        $objections = ObjectionCard::active()
            ->difficulty($difficulty)
            ->with('responses')
            ->inRandomOrder()
            ->limit($count)
            ->get();

        // Get some incorrect responses from other objections
        $incorrectResponses = ResponseCard::whereNotIn('objection_id', $objections->pluck('id'))
            ->inRandomOrder()
            ->limit($count * 2)
            ->get();

        // Prepare cards for the game
        $objectionCards = $objections->map(function ($objection) {
            return [
                'id' => $objection->id,
                'text' => $objection->objection_text,
                'type' => 'objection'
            ];
        });

        $responseCards = collect();
        
        // Add correct responses
        foreach ($objections as $objection) {
            $correctResponse = $objection->responses->first();
            if ($correctResponse) {
                $responseCards->push([
                    'id' => $correctResponse->id,
                    'objection_id' => $objection->id,
                    'text' => $correctResponse->response_text,
                    'type' => 'response',
                    'is_correct' => true
                ]);
            }
        }

        // Add some incorrect responses
        foreach ($incorrectResponses->take($count) as $response) {
            $responseCards->push([
                'id' => $response->id,
                'objection_id' => null,
                'text' => $response->response_text,
                'type' => 'response',
                'is_correct' => false
            ]);
        }

        return response()->json([
            'objections' => $objectionCards->shuffle()->values(),
            'responses' => $responseCards->shuffle()->values()
        ]);
    }

    public function saveObjectionSession(Request $request)
    {
        $validated = $request->validate([
            'score' => 'required|integer',
            'correct_matches' => 'required|integer',
            'total_attempts' => 'required|integer',
            'time_taken_seconds' => 'required|integer',
            'matches' => 'required|array'
        ]);

        $employee = auth()->user()->employee;

        $session = ObjectionGameSession::create([
            'employee_id' => $employee->id,
            'score' => $validated['score'],
            'correct_matches' => $validated['correct_matches'],
            'total_attempts' => $validated['total_attempts'],
            'time_taken_seconds' => $validated['time_taken_seconds'],
            'completed_at' => now()
        ]);

        // Update usage counts
        foreach ($validated['matches'] as $match) {
            if (isset($match['objection_id'])) {
                ObjectionCard::find($match['objection_id'])?->incrementUsage();
            }
            if (isset($match['response_id'])) {
                ResponseCard::find($match['response_id'])?->incrementUsage();
            }
        }

        return response()->json([
            'success' => true,
            'session_id' => $session->id,
            'message' => 'Game saved successfully!'
        ]);
    }

    // Tax Trivia Tower Game
    public function taxTriviaIndex()
    {
        $employee = auth()->user()->employee;
        $user = auth()->user();
        
        $stats = [
            'games_played' => TriviaGameSession::where('employee_id', $employee->id)->count(),
            'best_score' => TriviaGameSession::where('employee_id', $employee->id)->max('floors_climbed') ?? 0,
            'total_questions' => TriviaGameSession::where('employee_id', $employee->id)->sum('total_questions'),
            'accuracy' => $this->calculateAccuracy($employee->id, 'trivia'),
            'total_coins' => $user->coins,
        ];

        return Inertia::render('Games/TaxTrivia/Play', [
            'stats' => $stats
        ]);
    }

    public function getTriviaQuestions(Request $request)
    {
        $difficulty = $request->input('difficulty', 'medium');
        $count = $request->input('count', 15);

        $questions = TriviaQuestion::active()
            ->difficulty($difficulty)
            ->with('options')
            ->inRandomOrder()
            ->limit($count)
            ->get()
            ->map(function ($question) {
                return [
                    'id' => $question->id,
                    'question' => $question->question_text,
                    'options' => $question->options->shuffle()->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'text' => $option->option_text,
                            'is_correct' => $option->is_correct
                        ];
                    })->values(),
                    'explanation' => $question->explanation,
                    'category' => $question->category
                ];
            });

        return response()->json(['questions' => $questions]);
    }

    public function saveTriviaSession(Request $request)
    {
        $validated = $request->validate([
            'score' => 'required|integer',
            'floors_climbed' => 'required|integer',
            'correct_answers' => 'required|integer',
            'total_questions' => 'required|integer',
            'time_taken_seconds' => 'required|integer',
            'answers' => 'required|array'
        ]);

        $employee = auth()->user()->employee;
        $user = auth()->user();
        
        // Calculate coins earned
        $coinsPerCorrect = 10;
        $coinsPerWrong = -5;
        $correctAnswers = $validated['correct_answers'];
        $wrongAnswers = $validated['total_questions'] - $correctAnswers;
        $coinsEarned = ($correctAnswers * $coinsPerCorrect) + ($wrongAnswers * $coinsPerWrong);
        
        // Update user's total coins
        $user->increment('coins', $coinsEarned);

        $session = TriviaGameSession::create([
            'employee_id' => $employee->id,
            'score' => $validated['score'],
            'floors_climbed' => $validated['floors_climbed'],
            'correct_answers' => $validated['correct_answers'],
            'total_questions' => $validated['total_questions'],
            'time_taken_seconds' => $validated['time_taken_seconds'],
            'coins_earned' => $coinsEarned,
            'completed_at' => now()
        ]);

        // Update question statistics
        foreach ($validated['answers'] as $answer) {
            if (isset($answer['question_id']) && isset($answer['is_correct'])) {
                $question = TriviaQuestion::find($answer['question_id']);
                $question?->recordAnswer($answer['is_correct']);
                $question?->incrementUsage();
            }
        }

        return response()->json([
            'success' => true,
            'session_id' => $session->id,
            'coins_earned' => $coinsEarned,
            'total_coins' => $user->coins,
            'message' => 'Game saved successfully!'
        ]);
    }

    // Leaderboards
    public function leaderboard(Request $request)
    {
        $gameType = $request->input('game', 'objection_crusher');
        $period = $request->input('period', 'all_time');

        if ($gameType === 'objection_crusher') {
            $leaderboard = $this->getObjectionLeaderboard($period);
        } else {
            $leaderboard = $this->getTriviaLeaderboard($period);
        }

        return Inertia::render('Games/Leaderboard', [
            'leaderboard' => $leaderboard,
            'game_type' => $gameType,
            'period' => $period
        ]);
    }

    private function getObjectionLeaderboard($period)
    {
        $query = ObjectionGameSession::with('employee.user')
            ->selectRaw('employee_id, SUM(score) as total_score, COUNT(*) as games_played, MAX(score) as best_score')
            ->groupBy('employee_id');

        if ($period === 'daily') {
            $query->whereDate('completed_at', today());
        } elseif ($period === 'weekly') {
            $query->whereBetween('completed_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($period === 'monthly') {
            $query->whereMonth('completed_at', now()->month);
        }

        return $query->orderByDesc('total_score')
            ->limit(50)
            ->get()
            ->map(function ($item, $index) {
                return [
                    'rank' => $index + 1,
                    'employee_name' => $item->employee->user->name ?? 'Unknown',
                    'employee_code' => $item->employee->employee_code,
                    'total_score' => $item->total_score,
                    'games_played' => $item->games_played,
                    'best_score' => $item->best_score,
                    'profile_pic' => $item->employee->profile_pic
                ];
            });
    }

    private function getTriviaLeaderboard($period)
    {
        $query = TriviaGameSession::with('employee.user')
            ->selectRaw('employee_id, MAX(floors_climbed) as best_floors, SUM(correct_answers) as total_correct, COUNT(*) as games_played')
            ->groupBy('employee_id');

        if ($period === 'daily') {
            $query->whereDate('completed_at', today());
        } elseif ($period === 'weekly') {
            $query->whereBetween('completed_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($period === 'monthly') {
            $query->whereMonth('completed_at', now()->month);
        }

        return $query->orderByDesc('best_floors')
            ->orderByDesc('total_correct')
            ->limit(50)
            ->get()
            ->map(function ($item, $index) {
                return [
                    'rank' => $index + 1,
                    'employee_name' => $item->employee->user->name ?? 'Unknown',
                    'employee_code' => $item->employee->employee_code,
                    'best_floors' => $item->best_floors,
                    'total_correct' => $item->total_correct,
                    'games_played' => $item->games_played,
                    'profile_pic' => $item->employee->profile_pic
                ];
            });
    }

    private function calculateAccuracy($employeeId, $type)
    {
        if ($type === 'objection') {
            $sessions = ObjectionGameSession::where('employee_id', $employeeId)->get();
            $totalAttempts = $sessions->sum('total_attempts');
            $correctMatches = $sessions->sum('correct_matches');
        } else {
            $sessions = TriviaGameSession::where('employee_id', $employeeId)->get();
            $totalAttempts = $sessions->sum('total_questions');
            $correctMatches = $sessions->sum('correct_answers');
        }

        return $totalAttempts > 0 ? round(($correctMatches / $totalAttempts) * 100, 1) : 0;
    }
}
