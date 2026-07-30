<?php
namespace App\Services;

class SM2Service
{
    /**
     * Process SM-2 review and return updated progress array.
     * rating: 1=Again, 2=Hard, 3=Good, 4=Easy
     */
    public function processReview(array $progress, int $rating): array
    {
        $now = now();
        $qMap = [1 => 1, 2 => 3, 3 => 4, 4 => 5];
        $q    = $qMap[$rating] ?? 4;

        $interval        = $progress['interval'] ?? 1;
        $repetitionCount = $progress['repetition_count'] ?? 0;
        $easeFactor      = $progress['ease_factor'] ?? 2.5;

        // New ease factor
        $newEf = $easeFactor + (0.1 - (5 - $q) * (0.08 + (5 - $q) * 0.02));
        $newEf = max(1.3, round($newEf, 2));

        $newInterval        = 1;
        $newRepetitionCount = $repetitionCount;

        if ($rating === 1) {
            $newRepetitionCount = 0;
            $newInterval        = 1;
        } elseif ($rating === 2) {
            $newRepetitionCount++;
            $newInterval = max(1, (int) round($interval * 1.2));
        } elseif ($rating === 3) {
            $newRepetitionCount++;
            if ($newRepetitionCount === 1)      $newInterval = 1;
            elseif ($newRepetitionCount === 2)  $newInterval = 6;
            else                               $newInterval = (int) round($interval * $newEf);
        } elseif ($rating === 4) {
            $newRepetitionCount++;
            if ($newRepetitionCount === 1)      $newInterval = 2;
            elseif ($newRepetitionCount === 2)  $newInterval = 8;
            else                               $newInterval = (int) round($interval * $newEf * 1.3);
        }

        $nextDate  = $now->copy()->addDays($newInterval);
        $stability = max(1, (int) round($newInterval * 1.1));

        $newState = $progress['state'] ?? 'new';
        if ($rating === 1)           $newState = 'learning';
        elseif ($newInterval >= 21) $newState = 'mastered';
        elseif ($newRepetitionCount >= 1) $newState = 'review';

        $retrievabilityBefore = $this->calculateRetrievability($progress);

        $history   = $progress['history'] ?? [];
        $history[] = [
            'timestamp'              => $now->toISOString(),
            'rating'                 => $rating,
            'interval'               => $newInterval,
            'ease_factor'            => $newEf,
            'retrievability_before'  => $retrievabilityBefore,
        ];

        return [
            'card_key'         => $progress['card_key'],
            'interval'         => $newInterval,
            'repetition_count' => $newRepetitionCount,
            'ease_factor'      => $newEf,
            'last_reviewed_at' => $now->toISOString(),
            'next_review_at'   => $nextDate->toISOString(),
            'stability'        => $stability,
            'state'            => $newState,
            'history'          => $history,
        ];
    }

    /** Ebbinghaus: R = e^(-t/S), returns 0–100 */
    public function calculateRetrievability(array $progress): int
    {
        if (empty($progress['last_reviewed_at'])) return 100;

        $lastMs    = strtotime($progress['last_reviewed_at']) * 1000;
        $nowMs     = now()->getTimestampMs();
        $elapsed   = max(0, ($nowMs - $lastMs) / (1000 * 60 * 60 * 24));
        $stability = $progress['stability'] ?? $progress['interval'] ?? 1;

        $r = exp(-$elapsed / $stability);
        return (int) min(100, max(0, round($r * 100)));
    }

    /** Predict next intervals for all four ratings */
    public function getPredictedIntervals(array $progress): array
    {
        $interval = $progress['interval'] ?? 1;
        $ef       = $progress['ease_factor'] ?? 2.5;
        $reps     = $progress['repetition_count'] ?? 0;

        return [
            1 => 1,
            2 => max(1, (int) round($interval * 1.2)),
            3 => $reps === 0 ? 1 : ($reps === 1 ? 6 : (int) round($interval * $ef)),
            4 => $reps === 0 ? 2 : ($reps === 1 ? 8 : (int) round($interval * $ef * 1.3)),
        ];
    }
}
