import { CardProgress, SM2Rating, UserStats } from '../types';
import { FLASHCARDS_DATA } from '../data/manualData';

const STORAGE_KEY_PROGRESS = 'etax_sm2_card_progress_v1';
const STORAGE_KEY_STATS = 'etax_sm2_user_stats_v1';

/**
 * SuperMemo SM-2 Algorithm Implementation
 */
export function processSM2Review(
  currentProgress: CardProgress,
  rating: SM2Rating
): CardProgress {
  const now = new Date();
  const nowIso = now.toISOString();

  // Convert 1-4 rating to SM-2 q quality score (1 -> q=1, 2 -> q=3, 3 -> q=4, 4 -> q=5)
  const qMap: Record<SM2Rating, number> = {
    1: 1, // Again / Incorrect
    2: 3, // Hard
    3: 4, // Good
    4: 5, // Easy
  };
  const q = qMap[rating];

  let { interval, repetitionCount, easeFactor } = currentProgress;

  // Calculate new Ease Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEf = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEf < 1.3) newEf = 1.3;
  newEf = Math.round(newEf * 100) / 100;

  let newInterval = 1;
  let newRepetitionCount = repetitionCount;

  if (rating === 1) {
    // Forgot / Again
    newRepetitionCount = 0;
    newInterval = 1;
  } else if (rating === 2) {
    // Hard
    newRepetitionCount += 1;
    newInterval = Math.max(1, Math.round((interval || 1) * 1.2));
  } else if (rating === 3) {
    // Good
    newRepetitionCount += 1;
    if (newRepetitionCount === 1) {
      newInterval = 1;
    } else if (newRepetitionCount === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round((interval || 6) * newEf);
    }
  } else if (rating === 4) {
    // Easy
    newRepetitionCount += 1;
    if (newRepetitionCount === 1) {
      newInterval = 2;
    } else if (newRepetitionCount === 2) {
      newInterval = 8;
    } else {
      newInterval = Math.round((interval || 8) * newEf * 1.3);
    }
  }

  // Next review date calculation
  const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  // Determine state
  let newState = currentProgress.state;
  if (rating === 1) {
    newState = 'learning';
  } else if (newInterval >= 21) {
    newState = 'mastered';
  } else if (newRepetitionCount >= 1) {
    newState = 'review';
  }

  // Calculate stability (in days)
  const stability = Math.max(1, Math.round(newInterval * 1.1));

  // Current retrievability before update
  const retrievabilityBefore = calculateRetrievability(currentProgress, now.getTime());

  const newHistory = [
    ...(currentProgress.history || []),
    {
      timestamp: nowIso,
      rating,
      interval: newInterval,
      easeFactor: newEf,
      retrievabilityBefore,
    },
  ];

  return {
    cardId: currentProgress.cardId,
    interval: newInterval,
    repetitionCount: newRepetitionCount,
    easeFactor: newEf,
    lastReviewedAt: nowIso,
    nextReviewAt: nextDate.toISOString(),
    stability,
    state: newState,
    history: newHistory,
  };
}

/**
 * Ebbinghaus Memory Retrievability calculation: R = e^(-t/S)
 * Returns a value from 0 to 100 (percentage)
 */
export function calculateRetrievability(
  progress: CardProgress,
  currentTimeMs: number = Date.now()
): number {
  if (!progress.lastReviewedAt) {
    return 100; // New cards ready for first study
  }

  const lastReviewMs = new Date(progress.lastReviewedAt).getTime();
  const elapsedDays = Math.max(0, (currentTimeMs - lastReviewMs) / (1000 * 60 * 60 * 24));
  const stability = progress.stability || progress.interval || 1;

  // Formula: R = e^(-t/S)
  const retrievability = Math.exp(-elapsedDays / stability);
  return Math.min(100, Math.max(0, Math.round(retrievability * 100)));
}

/**
 * Predict next interval preview for SM-2 ratings
 */
export function getPredictedIntervals(progress: CardProgress): Record<SM2Rating, number> {
  const currentInterval = progress.interval || 1;
  const currentEf = progress.easeFactor || 2.5;
  const currentReps = progress.repetitionCount || 0;

  return {
    1: 1, // Again: 1 day
    2: Math.max(1, Math.round(currentInterval * 1.2)), // Hard
    3: currentReps === 0 ? 1 : currentReps === 1 ? 6 : Math.round(currentInterval * currentEf), // Good
    4: currentReps === 0 ? 2 : currentReps === 1 ? 8 : Math.round(currentInterval * currentEf * 1.3), // Easy
  };
}

/**
 * Load Card Progress Map from localStorage
 */
export function loadCardProgressMap(): Record<string, CardProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all current flashcards exist in progress map
      FLASHCARDS_DATA.forEach((card) => {
        if (!parsed[card.id]) {
          parsed[card.id] = createInitialProgress(card.id);
        }
      });
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load card progress:', err);
  }

  // Initial map if none exists
  const initialMap: Record<string, CardProgress> = {};
  FLASHCARDS_DATA.forEach((card) => {
    initialMap[card.id] = createInitialProgress(card.id);
  });
  return initialMap;
}

/**
 * Save Card Progress Map to localStorage
 */
export function saveCardProgressMap(map: Record<string, CardProgress>) {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save card progress:', err);
  }
}

/**
 * Create blank initial progress for a card
 */
export function createInitialProgress(cardId: string): CardProgress {
  const nowIso = new Date().toISOString();
  return {
    cardId,
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    lastReviewedAt: null,
    nextReviewAt: nowIso,
    stability: 1,
    state: 'new',
    history: [],
  };
}

/**
 * Load User Stats from localStorage
 */
export function loadUserStats(): UserStats {
  const defaultStats: UserStats = {
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalReviews: 0,
    correctReviews: 0,
    dailyGoalCards: 10,
    reviewsTodayCount: 0,
    lastReviewDate: null,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (raw) {
      const parsed = JSON.parse(raw) as UserStats;
      const today = new Date().toISOString().split('T')[0];

      // Reset daily counter if new day
      if (parsed.lastReviewDate !== today) {
        parsed.reviewsTodayCount = 0;
      }

      // Check streak
      if (parsed.lastActiveDate) {
        const last = new Date(parsed.lastActiveDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          // Continued streak
        } else if (diffDays > 1) {
          parsed.streakDays = 1; // Reset streak
        }
      }

      return parsed;
    }
  } catch (err) {
    console.error('Failed to load user stats:', err);
  }

  return defaultStats;
}

/**
 * Save User Stats to localStorage
 */
export function saveUserStats(stats: UserStats) {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats:', err);
  }
}

/**
 * Reset all progress to fresh state
 */
export function resetAllProgress(): {
  map: Record<string, CardProgress>;
  stats: UserStats;
} {
  localStorage.removeItem(STORAGE_KEY_PROGRESS);
  localStorage.removeItem(STORAGE_KEY_STATS);

  const newMap: Record<string, CardProgress> = {};
  FLASHCARDS_DATA.forEach((card) => {
    newMap[card.id] = createInitialProgress(card.id);
  });

  const newStats: UserStats = {
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalReviews: 0,
    correctReviews: 0,
    dailyGoalCards: 10,
    reviewsTodayCount: 0,
    lastReviewDate: null,
  };

  saveCardProgressMap(newMap);
  saveUserStats(newStats);

  return { map: newMap, stats: newStats };
}
