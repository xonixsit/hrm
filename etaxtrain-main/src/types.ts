/**
 * Type definitions for the E-Tax Planner USA Employee Training System
 */

export type SM2Rating = 1 | 2 | 3 | 4; // 1: Practice, 2: Hard, 3: Good, 4: Mastered

export type CardState = 'new' | 'learning' | 'review' | 'mastered';

export interface ReviewLog {
  timestamp: string;
  rating: SM2Rating;
  interval: number;
  easeFactor: number;
  retrievabilityBefore: number;
}

export interface CardProgress {
  cardId: string;
  interval: number; // in days
  repetitionCount: number; // consecutive successful reviews
  easeFactor: number; // default 2.5
  lastReviewedAt: string | null; // ISO date string
  nextReviewAt: string; // ISO date string
  stability: number; // estimated memory stability in days
  state: CardState;
  history: ReviewLog[];
}

export interface FlashcardItem {
  id: string;
  moduleId: string;
  pageNumber: number;
  title: string;
  prompt: string;
  exactAnswerText: string; // MUST match the source manual PDF word-for-word
  exactContextSnippet: string; // Full context paragraph from source text
  category: string;
  keyTerms: string[];
}

export interface ManualPage {
  pageNumber: number;
  title: string;
  verbatimText: string[];
  moduleTitle: string;
}

export interface ManualModule {
  id: string;
  title: string;
  pages: number[];
  description: string;
  iconName: string;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string | null;
  totalReviews: number;
  correctReviews: number;
  dailyGoalCards: number;
  reviewsTodayCount: number;
  lastReviewDate: string | null;
}
