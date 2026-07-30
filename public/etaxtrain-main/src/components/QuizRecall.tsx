import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCw,
  Sparkles,
  Award,
  Brain,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { FLASHCARDS_DATA } from '../data/manualData';
import { CardProgress, SM2Rating } from '../types';
import { processSM2Review } from '../lib/sm2';

interface QuizRecallProps {
  cardProgressMap: Record<string, CardProgress>;
  onSaveReview: (cardId: string, newProgress: CardProgress, rating: SM2Rating) => void;
  onGoToManualPage: (pageNumber: number) => void;
}

export const QuizRecall: React.FC<QuizRecallProps> = ({
  cardProgressMap,
  onSaveReview,
  onGoToManualPage,
}) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Shuffle or slice 10 quiz cards
  const quizCards = FLASHCARDS_DATA.slice(0, 15);
  const currentCard = quizCards[currentQuizIndex];

  if (!currentCard || currentQuizIndex >= quizCards.length) {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-6 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-8 text-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Quiz Challenge Complete!</h2>
          <p className="text-slate-600 text-sm">
            You scored <strong className="text-emerald-700">{score} out of {quizCards.length}</strong> on verbatim recall testing!
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentQuizIndex(0);
            setScore(0);
            setSelectedOption(null);
            setIsSubmitted(false);
          }}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs"
        >
          Restart Quiz Challenge
        </button>
      </div>
    );
  }

  // Generate 4 multiple choice options: 1 exact correct text, 3 distractors from other cards
  const generateOptions = () => {
    const correct = currentCard.exactAnswerText;
    const distractors = FLASHCARDS_DATA.filter((c) => c.id !== currentCard.id)
      .map((c) => c.exactAnswerText)
      .slice(0, 3);

    const all = [correct, ...distractors];
    // Deterministic pseudo-shuffle based on card ID
    all.sort((a, b) => (a.length % 2 === 0 ? 1 : -1));
    return all;
  };

  const options = generateOptions();

  const handleOptionSelect = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);

    const isCorrect = selectedOption === currentCard.exactAnswerText;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Update SM-2 score (Rating 3 if correct, Rating 1 if wrong)
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

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setCurrentQuizIndex((prev) => prev + 1);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-bold bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <span className="flex items-center space-x-2 text-indigo-600">
          <HelpCircle className="w-4 h-4" />
          <span>Verbatim Active Recall Quiz</span>
        </span>
        <span className="text-slate-700 font-mono">
          Question {currentQuizIndex + 1} of {quizCards.length} • Score: {score}
        </span>
      </div>

      {/* Main Quiz Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Manual Page {currentCard.pageNumber}
            </span>
            <button
              onClick={() => onGoToManualPage(currentCard.pageNumber)}
              className="text-xs text-slate-500 hover:text-indigo-600 font-bold underline flex items-center space-x-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Inspect Source Text</span>
            </button>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
            {currentCard.prompt}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentCard.exactAnswerText;

            let optionStyle = 'bg-slate-50 border-slate-200 hover:border-indigo-500 text-slate-800';

            if (isSubmitted) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-medium';
              } else {
                optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              optionStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-medium shadow-sm';
            }

            return (
              <div
                key={idx}
                onClick={() => handleOptionSelect(option)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start space-x-3 text-xs leading-relaxed ${optionStyle}`}
              >
                <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold shrink-0 mt-0.5 text-slate-700">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 font-sans font-medium text-slate-900">{option}</span>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                selectedOption
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
