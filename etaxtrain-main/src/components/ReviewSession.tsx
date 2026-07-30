import React, { useState } from 'react';
import {
  RotateCw,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { FlashcardItem, CardProgress, SM2Rating } from '../types';
import { processSM2Review, getPredictedIntervals } from '../lib/sm2';

interface ReviewSessionProps {
  queueCards: FlashcardItem[];
  cardProgressMap: Record<string, CardProgress>;
  onSaveReview: (cardId: string, newProgress: CardProgress, rating: SM2Rating) => void;
  onFinishSession: () => void;
  onGoToManualPage: (pageNumber: number) => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  queueCards,
  cardProgressMap,
  onSaveReview,
  onFinishSession,
  onGoToManualPage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0);

  const currentCard = queueCards[currentIndex];
  const currentProgress = currentCard
    ? cardProgressMap[currentCard.id] || {
        cardId: currentCard.id,
        interval: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
        lastReviewedAt: null,
        nextReviewAt: new Date().toISOString(),
        stability: 1,
        state: 'new',
        history: [],
      }
    : null;

  const predictedIntervals = currentProgress ? getPredictedIntervals(currentProgress) : null;

  const handleRatingClick = (rating: SM2Rating) => {
    if (!currentCard || !currentProgress) return;

    const updatedProgress = processSM2Review(currentProgress, rating);
    onSaveReview(currentCard.id, updatedProgress, rating);

    setSessionCompletedCount((prev) => prev + 1);
    setIsAnswerRevealed(false);

    if (currentIndex + 1 < queueCards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session finished
      setCurrentIndex(queueCards.length);
    }
  };

  // If no cards due or queue finished
  if (!currentCard || currentIndex >= queueCards.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6 text-center bg-white rounded-2xl border border-slate-200 shadow-md my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Daily Review Session Complete!</h2>
          <p className="text-slate-600 text-sm">
            You reviewed <strong className="text-emerald-600">{sessionCompletedCount} items</strong> today! Your learning progress has been saved.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center space-x-2 font-semibold text-indigo-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Training Summary:</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-normal">
            Consistent daily review strengthens your knowledge of the E-Tax Planner USA manual rules, ensuring accurate and compliant tax operations.
          </p>
        </div>

        <button
          onClick={onFinishSession}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Queue Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
          <span className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Daily Practice Queue</span>
          </span>
          <span>
            Card {currentIndex + 1} of {queueCards.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIndex) / queueCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col justify-between min-h-[420px]">
        {/* Flashcard Header Info */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              Module: Page {currentCard.pageNumber}
            </span>
            <span className="text-slate-600 font-medium">{currentCard.category}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onGoToManualPage(currentCard.pageNumber)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Original Manual Page</span>
            </button>

            <span className="text-slate-500 font-medium flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interval: {currentProgress?.interval || 1} days</span>
            </span>
          </div>
        </div>

        {/* Flashcard Body Content */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
          {/* Active Recall Prompt (Question) */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
              Question Prompt:
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {currentCard.prompt}
            </h2>
          </div>

          {/* Reveal Answer Section or Revealed Exact Text */}
          {!isAnswerRevealed ? (
            <div className="pt-6 border-t border-slate-100 text-center space-y-4">
              <p className="text-xs text-slate-500 italic font-medium">
                Try to recall the exact information in your mind before revealing the answer.
              </p>
              <button
                onClick={() => setIsAnswerRevealed(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 mx-auto"
              >
                <RotateCw className="w-4 h-4" />
                <span>Show Verbatim Manual Answer</span>
              </button>
            </div>
          ) : (
            /* Revealed Answer Display */
            <div className="pt-6 border-t border-slate-100 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Exact Source Text (Manual Page {currentCard.pageNumber}):</span>
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  100% Verbatim Match
                </span>
              </div>

              {/* Exact Text Content Box */}
              <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 font-mono text-sm leading-relaxed whitespace-pre-line shadow-inner">
                {currentCard.exactAnswerText}
              </div>

              {/* Key Terms Highlights */}
              {currentCard.keyTerms && currentCard.keyTerms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-semibold">Key Terms:</span>
                  {currentCard.keyTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans font-medium"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}

              {/* Self Assessment Box */}
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <div className="flex items-center space-x-1.5 font-extrabold text-indigo-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Self-Assessment:</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed font-normal">
                  Compare your mental answer with the exact manual text above, then select how confident you felt.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Self-Grading Buttons (Only visible after answer revealed) */}
        {isAnswerRevealed && (
          <div className="bg-slate-50 p-6 border-t border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 text-center block uppercase tracking-wider">
              How well did you recall this answer?
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Again (1) */}
              <button
                onClick={() => handleRatingClick(1)}
                className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all flex flex-col items-center justify-center space-y-1 group shadow-sm"
              >
                <span className="font-bold text-sm text-rose-700 group-hover:scale-105 transition-transform">
                  Need Practice (1)
                </span>
                <span className="text-[11px] text-slate-600 font-semibold">
                  Review Tomorrow
                </span>
              </button>

              {/* Hard (2) */}
              <button
                onClick={() => handleRatingClick(2)}
                className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all flex flex-col items-center justify-center space-y-1 group shadow-sm"
              >
                <span className="font-bold text-sm text-amber-700 group-hover:scale-105 transition-transform">
                  Hard (2)
                </span>
                <span className="text-[11px] text-slate-600 font-semibold">
                  {predictedIntervals ? `In ${predictedIntervals[2]} Days` : 'In 2 Days'}
                </span>
              </button>

              {/* Good (3) */}
              <button
                onClick={() => handleRatingClick(3)}
                className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-all flex flex-col items-center justify-center space-y-1 group shadow-sm"
              >
                <span className="font-bold text-sm text-indigo-700 group-hover:scale-105 transition-transform">
                  Good (3)
                </span>
                <span className="text-[11px] text-slate-600 font-semibold">
                  {predictedIntervals ? `In ${predictedIntervals[3]} Days` : 'In 3 Days'}
                </span>
              </button>

              {/* Easy (4) */}
              <button
                onClick={() => handleRatingClick(4)}
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex flex-col items-center justify-center space-y-1 group shadow-sm"
              >
                <span className="font-bold text-sm text-emerald-700 group-hover:scale-105 transition-transform">
                  Mastered (4)
                </span>
                <span className="text-[11px] text-slate-600 font-semibold">
                  {predictedIntervals ? `In ${predictedIntervals[4]} Days` : 'In 4 Days'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
