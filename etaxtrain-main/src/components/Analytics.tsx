import React from 'react';
import {
  BarChart3,
  Flame,
  Award,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { CardProgress, UserStats } from '../types';
import { FLASHCARDS_DATA } from '../data/manualData';
import { calculateRetrievability } from '../lib/sm2';

interface AnalyticsProps {
  cardProgressMap: Record<string, CardProgress>;
  userStats: UserStats;
  onResetProgress: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  cardProgressMap,
  userStats,
  onResetProgress,
}) => {
  const totalCards = FLASHCARDS_DATA.length;

  // Compute state breakdown
  let newCount = 0;
  let learningCount = 0;
  let reviewCount = 0;
  let masteredCount = 0;
  let totalReviewsHistory = 0;
  let retrievabilitySum = 0;

  FLASHCARDS_DATA.forEach((card) => {
    const prog = cardProgressMap[card.id];
    if (prog) {
      if (prog.state === 'new') newCount++;
      else if (prog.state === 'learning') learningCount++;
      else if (prog.state === 'review') reviewCount++;
      else if (prog.state === 'mastered') masteredCount++;

      totalReviewsHistory += prog.history ? prog.history.length : 0;
      retrievabilitySum += calculateRetrievability(prog);
    }
  });

  const avgRetrievability = Math.round(retrievabilitySum / (totalCards || 1));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-900">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold">
          <BarChart3 className="w-4 h-4 text-indigo-300" />
          <span>Employee Learning & Progress Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Learning Progress & Manual Mastery Breakdown
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed font-normal">
          Track your review history, retention levels, and mastery across the 26-page E-Tax Planner USA training manual over time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Practice Reviews</span>
            <RefreshCw className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalReviewsHistory}</div>
          <p className="text-[11px] text-slate-500">Total practice trials completed</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Knowledge Retention</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{avgRetrievability}%</div>
          <p className="text-[11px] text-slate-500">Average retention probability</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700">{userStats.streakDays} Days</div>
          <p className="text-[11px] text-slate-500">Consecutive active days</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Mastered Items</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-900">{masteredCount}</div>
          <p className="text-[11px] text-slate-500">Review interval &gt; 21 days</p>
        </div>
      </div>

      {/* Item Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span>Topic & Item Progress Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Per-item breakdown of current review status, page numbers, interval, and retention score.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all learning progress? This cannot be undone.')) {
                onResetProgress();
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-colors self-start sm:self-auto"
          >
            Reset All Progress
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                <th className="py-3 px-3">Card Prompt</th>
                <th className="py-3 px-3">Page</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Interval</th>
                <th className="py-3 px-3">Reviews</th>
                <th className="py-3 px-3">Retention Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {FLASHCARDS_DATA.map((card) => {
                const prog = cardProgressMap[card.id];
                const ret = prog ? calculateRetrievability(prog) : 100;

                return (
                  <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900 max-w-xs truncate">
                      {card.prompt}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">P{card.pageNumber}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          prog?.state === 'mastered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : prog?.state === 'review'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {prog?.state || 'New'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{prog?.interval || 1} days</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{prog?.repetitionCount || 0}</td>
                    <td className="py-3 px-3 font-mono font-extrabold text-emerald-700">
                      {ret}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
