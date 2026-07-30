<?php
namespace App\Http\Controllers;

use App\Models\TrainingCardProgress;
use App\Models\TrainingFlashcard;
use App\Models\TrainingUserStats;
use App\Services\SM2Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
class TrainingController extends Controller
{
    public function __construct(private SM2Service $sm2) {}

    // ── Main page (loads everything) ────────────────────────────────────────
    public function index()
    {
        $user      = Auth::user();
        $modules   = DB::table('training_modules')->orderBy('sort_order')->get()
            ->map(fn($m) => array_merge((array)$m, ['pages' => json_decode($m->pages)]));
        $pages     = DB::table('manual_pages')->orderBy('page_number')->get()
            ->map(fn($p) => array_merge((array)$p, ['verbatim_text' => json_decode($p->verbatim_text)]));
        $flashcards = TrainingFlashcard::orderBy('page_number')->get()
            ->map(fn($c) => $c->toArray());

        $progressMap = $this->getProgressMap($user->id);
        $stats       = $this->getOrCreateStats($user->id);

        return Inertia::render('Training/Index', [
            'modules'     => $modules,
            'pages'       => $pages,
            'flashcards'  => $flashcards,
            'progressMap' => $progressMap,
            'userStats'   => $stats,
        ]);
    }

    // ── Save a card review ───────────────────────────────────────────────────
    public function saveReview(Request $request)
    {
        $request->validate([
            'card_key' => 'required|string',
            'rating'   => 'required|integer|in:1,2,3,4',
        ]);

        $user    = Auth::user();
        $cardKey = $request->card_key;
        $rating  = (int) $request->rating;

        $existing = TrainingCardProgress::where('user_id', $user->id)
            ->where('card_key', $cardKey)->first();

        $currentProgress = $existing ? $existing->toArray() : [
            'card_key'         => $cardKey,
            'interval'         => 1,
            'repetition_count' => 0,
            'ease_factor'      => 2.5,
            'last_reviewed_at' => null,
            'next_review_at'   => now()->toISOString(),
            'stability'        => 1,
            'state'            => 'new',
            'history'          => [],
        ];

        $updated = $this->sm2->processReview($currentProgress, $rating);

        TrainingCardProgress::updateOrCreate(
            ['user_id' => $user->id, 'card_key' => $cardKey],
            [
                'interval'         => $updated['interval'],
                'repetition_count' => $updated['repetition_count'],
                'ease_factor'      => $updated['ease_factor'],
                'last_reviewed_at' => $updated['last_reviewed_at'],
                'next_review_at'   => $updated['next_review_at'],
                'stability'        => $updated['stability'],
                'state'            => $updated['state'],
                'history'          => $updated['history'],
            ]
        );

        $this->updateStats($user->id, $rating);

        return response()->json([
            'progress' => $updated,
            'stats'    => $this->getOrCreateStats($user->id),
        ]);
    }

    // ── Reset all progress ───────────────────────────────────────────────────
    public function resetProgress()
    {
        $user = Auth::user();
        TrainingCardProgress::where('user_id', $user->id)->delete();
        TrainingUserStats::where('user_id', $user->id)->delete();
        return response()->json(['ok' => true]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private function getProgressMap(int $userId): array
    {
        $rows = TrainingCardProgress::where('user_id', $userId)->get();
        $map  = [];
        foreach ($rows as $r) {
            $arr = $r->toArray();
            $arr['retrievability'] = $this->sm2->calculateRetrievability($arr);
            $map[$r->card_key]     = $arr;
        }
        return $map;
    }

    private function getOrCreateStats(int $userId): array
    {
        $today = now()->toDateString();
        $s = TrainingUserStats::firstOrCreate([
            'user_id' => $userId
        ], [
            'streak_days' => 1,
            'last_active_date' => $today,
            'total_reviews' => 0,
            'correct_reviews' => 0,
            'daily_goal_cards' => 10,
            'reviews_today_count' => 0,
            'last_review_date' => null,
        ]);

        // Reset daily count if new day
        if ($s->last_review_date !== $today) {
            $s->reviews_today_count = 0;
        }

        // Streak logic
        if ($s->last_active_date) {
            $lastActive = Carbon::parse($s->last_active_date)->startOfDay();
            $diff = Carbon::now()->startOfDay()->diffInDays($lastActive, false);
            if ($diff === 1) {
                $s->streak_days += 1; // consecutive day
            } elseif ($diff > 1) {
                $s->streak_days = 1; // missed a day, reset
            }
            // if $diff == 0, same day, keep streak unchanged
        }

        $s->last_active_date = $today;
        $s->save();

        return $s->toArray();
    }

    private function updateStats(int $userId, int $rating): void
    {
        $today = now()->toDateString();
        $s     = TrainingUserStats::firstOrCreate(['user_id' => $userId]);
        $s->total_reviews++;
        if ($rating >= 3) $s->correct_reviews++;
        $s->reviews_today_count = ($s->last_review_date === $today)
            ? $s->reviews_today_count + 1 : 1;
        $s->last_review_date = $today;
        $s->last_active_date = $today;
        $s->save();
    }
}