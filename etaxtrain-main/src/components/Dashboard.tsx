import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  GraduationCap,
  Target,
  FileText,
  X,
  BarChart2,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { CardProgress, UserStats } from '../types';
import { MANUAL_MODULES, FLASHCARDS_DATA } from '../data/manualData';
import { calculateRetrievability } from '../lib/sm2';

interface DashboardProps {
  cardProgressMap: Record<string, CardProgress>;
  userStats: UserStats;
  onStartReview: () => void;
  onGoToManualModule: (moduleId: string) => void;
  onGoToBrainScience?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cardProgressMap,
  userStats,
  onStartReview,
  onGoToManualModule,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const now = new Date();
  const nowIso = now.toISOString();

  // Compute card progress counts
  let dueCount = 0;
  let newCount = 0;
  let learningCount = 0;
  let reviewCount = 0;
  let masteredCount = 0;
  let totalRetrievabilitySum = 0;

  FLASHCARDS_DATA.forEach((card) => {
    const prog = cardProgressMap[card.id];
    if (prog) {
      if (prog.nextReviewAt <= nowIso || prog.state === 'new') {
        dueCount++;
      }
      if (prog.state === 'new') newCount++;
      else if (prog.state === 'learning') learningCount++;
      else if (prog.state === 'review') reviewCount++;
      else if (prog.state === 'mastered') masteredCount++;

      totalRetrievabilitySum += calculateRetrievability(prog, now.getTime());
    }
  });

  const totalCards = FLASHCARDS_DATA.length;
  const avgRetrievability = Math.round(totalRetrievabilitySum / (totalCards || 1));

  return (
    <div className="min-h-screen text-slate-900 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Clean Header Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs px-3 py-1 rounded-full font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
              <span>Official Employee Training Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              E-Tax Planner USA Training System
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed font-normal">
              Master the official 26-page Employee Training Manual USA with 100% exact verbatim compliance. Select a module card below to begin learning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onStartReview}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl shadow-md shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Review ({dueCount} Due)</span>
            </button>

            {/* CTA Button to open right side slider */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-semibold px-5 py-3 rounded-xl transition-all duration-200"
            >
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Stats & Study Guide</span>
              <span className="ml-1 text-[11px] bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-extrabold">
                {avgRetrievability}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Modules Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Training Manual Modules (12 Modules)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            100% Verbatim E-Tax Planner USA Manual Content. Click any module to study its pages.
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
        >
          <BarChart2 className="w-4 h-4" />
          <span>View Progress Overview</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clean Landing Page: Modules Cards Grid ONLY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MANUAL_MODULES.map((mod) => {
          // Count cards in this module
          const modCards = FLASHCARDS_DATA.filter((c) => c.moduleId === mod.id);
          const modMastered = modCards.filter(
            (c) => cardProgressMap[c.id]?.state === 'mastered'
          ).length;

          return (
            <div
              key={mod.id}
              onClick={() => onGoToManualModule(mod.id)}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                    Pages {mod.pages.join(', ')}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{modCards.length} Questions</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors leading-snug">
                  {mod.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                  {mod.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Mastered: <strong className="text-emerald-600 font-extrabold">{modMastered}</strong> / {modCards.length}
                </span>
                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-bold">
                  <span>Study Pages</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Side Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md lg:max-w-lg bg-slate-900 text-white shadow-2xl overflow-y-auto border-l border-slate-800 p-6 space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">Progress & Study Guide</h2>
                    <p className="text-xs text-slate-400 font-medium">E-Tax Planner USA Operational Stats</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Key Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Metric 1: Cards Due */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Due Today</span>
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{dueCount}</div>
                  <p className="text-[10px] text-indigo-300 font-medium">of {totalCards} items</p>
                </div>

                {/* Metric 2: Retention */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Retention</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">{avgRetrievability}%</div>
                  <p className="text-[10px] text-emerald-300 font-medium">Target &gt;80%</p>
                </div>

                {/* Metric 3: Streak */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Streak</span>
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-500/20" />
                  </div>
                  <div className="text-2xl font-black text-amber-400">{userStats.streakDays}d</div>
                  <p className="text-[10px] text-amber-300 font-medium">Consecutive Days</p>
                </div>

                {/* Metric 4: Mastered */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Mastered</span>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-purple-300">{masteredCount}</div>
                  <p className="text-[10px] text-purple-300 font-medium">
                    {Math.round((masteredCount / (totalCards || 1)) * 100)}% of Manual
                  </p>
                </div>
              </div>

              {/* Training Manual Mastery Status */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span>Mastery Breakdown</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>Overall Mastery</span>
                    <span className="text-indigo-300">
                      {Math.round(((masteredCount + reviewCount) / totalCards) * 100)}% Complete
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-900 overflow-hidden flex border border-slate-700">
                    <div
                      style={{ width: `${(newCount / totalCards) * 100}%` }}
                      className="bg-sky-500"
                      title={`New: ${newCount}`}
                    />
                    <div
                      style={{ width: `${(learningCount / totalCards) * 100}%` }}
                      className="bg-amber-500"
                      title={`Learning: ${learningCount}`}
                    />
                    <div
                      style={{ width: `${(reviewCount / totalCards) * 100}%` }}
                      className="bg-indigo-500"
                      title={`Review: ${reviewCount}`}
                    />
                    <div
                      style={{ width: `${(masteredCount / totalCards) * 100}%` }}
                      className="bg-emerald-500"
                      title={`Mastered: ${masteredCount}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="text-slate-300">New: <strong className="text-white">{newCount}</strong></span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-300">Learning: <strong className="text-white">{learningCount}</strong></span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-300">Reviewing: <strong className="text-white">{reviewCount}</strong></span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Mastered: <strong className="text-white">{masteredCount}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onStartReview();
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Practice Session</span>
                </button>
              </div>

              {/* Employee Study Guide */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Employee Study Guidelines</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
                    <span className="font-extrabold text-indigo-300 block">
                      1. Daily Active Practice
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      Completing daily reviews ensures maximum retention with minimal effort.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
                    <span className="font-extrabold text-emerald-300 block">
                      2. Verbatim Accuracy
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      Focus on key tax figures, dollar limits, and form names to maintain compliance.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
                    <span className="font-extrabold text-amber-300 block">
                      3. Practice Quizzes
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      Use the Practice Quizzes tab to test your verbatim recall against exact manual questions.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onGoToManualModule('all');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Read Full Training Manual</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

