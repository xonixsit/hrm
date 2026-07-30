import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ReviewSession } from './components/ReviewSession';
import { ManualLibrary } from './components/ManualLibrary';
import { QuizRecall } from './components/QuizRecall';
import { Analytics } from './components/Analytics';
import {
  CardProgress,
  UserStats,
  SM2Rating,
  FlashcardItem,
} from './types';
import { FLASHCARDS_DATA } from './data/manualData';
import {
  loadCardProgressMap,
  saveCardProgressMap,
  loadUserStats,
  saveUserStats,
  resetAllProgress,
  calculateRetrievability,
} from './lib/sm2';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cardProgressMap, setCardProgressMap] = useState<Record<string, CardProgress>>({});
  const [userStats, setUserStats] = useState<UserStats>({
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalReviews: 0,
    correctReviews: 0,
    dailyGoalCards: 10,
    reviewsTodayCount: 0,
    lastReviewDate: null,
  });

  const [selectedManualModuleId, setSelectedManualModuleId] = useState<string | null>(null);
  const [selectedManualPageNum, setSelectedManualPageNum] = useState<number | null>(null);

  // Initial load
  useEffect(() => {
    const loadedMap = loadCardProgressMap();
    const loadedStats = loadUserStats();
    setCardProgressMap(loadedMap);
    setUserStats(loadedStats);
  }, []);

  // Compute due cards queue
  const nowIso = new Date().toISOString();
  const dueCards: FlashcardItem[] = FLASHCARDS_DATA.filter((card) => {
    const prog = cardProgressMap[card.id];
    if (!prog) return true;
    return prog.nextReviewAt <= nowIso || prog.state === 'new';
  });

  // Calculate average retention level
  let retrievabilitySum = 0;
  FLASHCARDS_DATA.forEach((card) => {
    const prog = cardProgressMap[card.id];
    if (prog) {
      retrievabilitySum += calculateRetrievability(prog);
    }
  });
  const avgRetrievability = Math.round(retrievabilitySum / (FLASHCARDS_DATA.length || 1));

  // Handle saving review result
  const handleSaveReview = (cardId: string, updatedProgress: CardProgress, rating: SM2Rating) => {
    const newMap = {
      ...cardProgressMap,
      [cardId]: updatedProgress,
    };
    setCardProgressMap(newMap);
    saveCardProgressMap(newMap);

    // Update stats
    const today = new Date().toISOString().split('T')[0];
    const isCorrect = rating >= 3;

    const newStats: UserStats = {
      ...userStats,
      totalReviews: userStats.totalReviews + 1,
      correctReviews: userStats.correctReviews + (isCorrect ? 1 : 0),
      reviewsTodayCount:
        userStats.lastReviewDate === today ? userStats.reviewsTodayCount + 1 : 1,
      lastReviewDate: today,
      lastActiveDate: today,
    };

    setUserStats(newStats);
    saveUserStats(newStats);
  };

  // Handle progress reset
  const handleResetProgress = () => {
    const { map, stats } = resetAllProgress();
    setCardProgressMap(map);
    setUserStats(stats);
  };

  // Jump to specific module in manual library
  const handleGoToManualModule = (moduleId: string) => {
    setSelectedManualModuleId(moduleId);
    setSelectedManualPageNum(null);
    setActiveTab('manual-lib');
  };

  // Jump to specific page in manual library
  const handleGoToManualPage = (pageNumber: number) => {
    setSelectedManualPageNum(pageNumber);
    setSelectedManualModuleId(null);
    setActiveTab('manual-lib');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dueCardsCount={dueCards.length}
        streakDays={userStats.streakDays}
        avgRetrievability={avgRetrievability}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            cardProgressMap={cardProgressMap}
            userStats={userStats}
            onStartReview={() => setActiveTab('review')}
            onGoToManualModule={handleGoToManualModule}
          />
        )}

        {activeTab === 'review' && (
          <ReviewSession
            queueCards={dueCards.length > 0 ? dueCards : FLASHCARDS_DATA}
            cardProgressMap={cardProgressMap}
            onSaveReview={handleSaveReview}
            onFinishSession={() => setActiveTab('dashboard')}
            onGoToManualPage={handleGoToManualPage}
          />
        )}

        {activeTab === 'manual-lib' && (
          <ManualLibrary
            cardProgressMap={cardProgressMap}
            selectedModuleId={selectedManualModuleId}
            selectedPageNum={selectedManualPageNum}
            onSelectPageToStudy={handleGoToManualPage}
            onSaveReview={handleSaveReview}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizRecall
            cardProgressMap={cardProgressMap}
            onSaveReview={handleSaveReview}
            onGoToManualPage={handleGoToManualPage}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            cardProgressMap={cardProgressMap}
            userStats={userStats}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            E-TAX PLANNER Employee Training Manual USA • Chicago IL 60659
          </span>
          <span className="font-medium text-slate-600">
            100% Verbatim Content Compliance • Intelligent Training System
          </span>
        </div>
      </footer>
    </div>
  );
}
