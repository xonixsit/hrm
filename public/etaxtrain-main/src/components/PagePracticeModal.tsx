import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Brain,
} from 'lucide-react';
import { FlashcardItem, CardProgress, SM2Rating } from '../types';
import { processSM2Review, getPredictedIntervals } from '../lib/sm2';
import { FLASHCARDS_DATA } from '../data/manualData';

interface PagePracticeModalProps {
  pageNumber: number;
  pageTitle: string;
  cards: FlashcardItem[];
  cardProgressMap: Record<string, CardProgress>;
  onSaveReview: (cardId: string, updatedProgress: CardProgress, rating: SM2Rating) => void;
  onClose: () => void;
}

export const PagePracticeModal: React.FC<PagePracticeModalProps> = ({
  pageNumber,
  pageTitle,
  cards,
  cardProgressMap,
  onSaveReview,
  onClose,
}) => {
  const [mode, setMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Flashcard mode state
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Quiz mode state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const currentCard = cards[currentIndex];

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

  // Handle flashcard rating
  const handleRating = (rating: SM2Rating) => {
    if (!currentCard || !currentProgress) return;
    const updated = processSM2Review(currentProgress, rating);
    onSaveReview(currentCard.id, updated, rating);

    setIsAnswerRevealed(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(cards.length); // complete
    }
  };

  // Generate 4 multiple choice options for quiz mode
  const getQuizOptions = () => {
    if (!currentCard) return [];
    const correct = currentCard.exactAnswerText;
    const distractors = FLASHCARDS_DATA.filter((c) => c.id !== currentCard.id)
      .map((c) => c.exactAnswerText)
      .slice(0, 3);

    const options = [correct, ...distractors];
    // Simple deterministic shuffle
    options.sort((a, b) => (a.length % 2 === 0 ? 1 : -1));
    return options;
  };

  const quizOptions = getQuizOptions();

  const handleQuizSubmit = () => {
    if (!selectedOption || !currentCard) return;
    setIsQuizSubmitted(true);
    const isCorrect = selectedOption === currentCard.exactAnswerText;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    const rating: SM2Rating = isCorrect ? 3 : 1;
    const prog = cardProgressMap[currentCard.id] || {
      cardId: currentCard.id,
      interval: 1,
      repetitionCount: 0,
      easeFactor: 2.5,
      lastReviewedAt: null,
      nextReviewAt: new Date().toISOString(),
      stability: 1,
      state: 'new',
      history: [],
    };
    const updated = processSM2Review(prog, rating);
    onSaveReview(currentCard.id, updated, rating);
  };

  const handleQuizNext = () => {
    setSelectedOption(null);
    setIsQuizSubmitted(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(cards.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
              P{pageNumber}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-extrabold text-white leading-tight">
                  Practice Page {pageNumber} Questions
                </h3>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">{pageTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Bar */}
        {cards.length > 0 && currentIndex < cards.length && (
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-xl">
              <button
                onClick={() => {
                  setMode('flashcard');
                  setIsAnswerRevealed(false);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  mode === 'flashcard'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Flashcards (SM-2)
              </button>
              <button
                onClick={() => {
                  setMode('quiz');
                  setSelectedOption(null);
                  setIsQuizSubmitted(false);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  mode === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Multiple Choice Quiz
              </button>
            </div>

            <span className="font-mono text-slate-600 font-bold">
              Question {currentIndex + 1} of {cards.length}
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {cards.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-lg font-bold text-slate-800">No practice questions for Page {pageNumber} yet.</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Read the verbatim source text on Page {pageNumber} to master the manual content.
              </p>
            </div>
          ) : currentIndex >= cards.length ? (
            /* Session Completed Screen */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-extrabold text-slate-900">Page {pageNumber} Practice Complete!</h4>
                <p className="text-xs text-slate-600">
                  You reviewed all {cards.length} questions for <strong>Page {pageNumber}: {pageTitle}</strong>!
                </p>
                {mode === 'quiz' && (
                  <p className="text-sm font-bold text-emerald-700 pt-2">
                    Quiz Score: {quizScore} / {cards.length} correct
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white text-left text-xs space-y-1 border border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Spaced Repetition Updated</span>
                </span>
                <p className="text-slate-300">
                  Your retention score for these Page {pageNumber} cards has been updated according to the SM-2 learning engine.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsAnswerRevealed(false);
                    setSelectedOption(null);
                    setIsQuizSubmitted(false);
                    setQuizScore(0);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Restart Page {pageNumber} Practice
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Close Practice Window
                </button>
              </div>
            </div>
          ) : mode === 'flashcard' ? (
            /* Flashcard View */
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                  {currentCard.category} • Page {pageNumber}
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {currentCard.prompt}
                </h4>
              </div>

              {!isAnswerRevealed ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <p className="text-xs text-slate-500 italic">
                    Think of the exact manual answer in your head before revealing.
                  </p>
                  <button
                    onClick={() => setIsAnswerRevealed(true)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 mx-auto shadow-sm transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Reveal Exact Verbatim Answer</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs leading-relaxed border border-slate-800 whitespace-pre-line shadow-inner">
                    {currentCard.exactAnswerText}
                  </div>

                  {currentCard.keyTerms && currentCard.keyTerms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-500 font-bold text-[11px]">Key Terms:</span>
                      {currentCard.keyTerms.map((kt, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[11px]">
                          {kt}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Self Assessment Rating Buttons */}
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block text-center uppercase tracking-wider">
                      How well did you recall this answer?
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleRating(1)}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-center text-xs font-bold transition-all"
                      >
                        Need Practice (1)
                      </button>
                      <button
                        onClick={() => handleRating(2)}
                        className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-center text-xs font-bold transition-all"
                      >
                        Hard (2)
                      </button>
                      <button
                        onClick={() => handleRating(3)}
                        className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-center text-xs font-bold transition-all"
                      >
                        Good (3)
                      </button>
                      <button
                        onClick={() => handleRating(4)}
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-center text-xs font-bold transition-all"
                      >
                        Mastered (4)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz View */
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Multiple Choice Question
                </span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                  {currentCard.prompt}
                </h4>
              </div>

              <div className="space-y-2.5">
                {quizOptions.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentCard.exactAnswerText;

                  let optionStyle = 'bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-800';
                  if (isQuizSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-xs';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !isQuizSubmitted && setSelectedOption(opt)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs leading-relaxed flex items-start space-x-2.5 ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-[10px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 font-medium text-slate-900">{opt}</span>
                      {isQuizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                      {isQuizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                {!isQuizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={!selectedOption}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      selectedOption
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleQuizNext}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
