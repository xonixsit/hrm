import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MANUAL_PAGES, MANUAL_MODULES, FLASHCARDS_DATA } from '../data/manualData';
import { CardProgress, SM2Rating } from '../types';
import { calculateRetrievability } from '../lib/sm2';
import { USMapComponent } from './USMapComponent';
import { PagePracticeModal } from './PagePracticeModal';

interface ManualLibraryProps {
  cardProgressMap: Record<string, CardProgress>;
  selectedModuleId?: string | null;
  selectedPageNum?: number | null;
  onSelectPageToStudy: (pageNumber: number) => void;
  onSaveReview?: (cardId: string, updatedProgress: CardProgress, rating: SM2Rating) => void;
}

export const ManualLibrary: React.FC<ManualLibraryProps> = ({
  cardProgressMap,
  selectedModuleId,
  selectedPageNum,
  onSelectPageToStudy,
  onSaveReview = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModuleFilter, setActiveModuleFilter] = useState<string | 'all'>(
    selectedModuleId || 'all'
  );
  const [activePageNum, setActivePageNum] = useState<number | null>(selectedPageNum || null);
  const [practiceModalPageNum, setPracticeModalPageNum] = useState<number | null>(null);
  const scrollPillsRef = useRef<HTMLDivElement>(null);
  const hoverScrollRef = useRef<number | null>(null);

  const startHoverScroll = (direction: 'left' | 'right') => {
    stopHoverScroll();
    const scrollStep = () => {
      if (scrollPillsRef.current) {
        scrollPillsRef.current.scrollBy({
          left: direction === 'left' ? -6 : 6,
          behavior: 'auto',
        });
      }
      hoverScrollRef.current = requestAnimationFrame(scrollStep);
    };
    hoverScrollRef.current = requestAnimationFrame(scrollStep);
  };

  const stopHoverScroll = () => {
    if (hoverScrollRef.current !== null) {
      cancelAnimationFrame(hoverScrollRef.current);
      hoverScrollRef.current = null;
    }
  };

  const scrollPills = (direction: 'left' | 'right') => {
    if (scrollPillsRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollPillsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Helper to handle selecting a page and auto-syncing module filter
  const handleSelectPage = (pageNum: number | null) => {
    setActivePageNum(pageNum);
    if (pageNum !== null) {
      const parentMod = MANUAL_MODULES.find((m) => m.pages.includes(pageNum));
      if (parentMod) {
        setActiveModuleFilter(parentMod.id);
      }
    }
  };

  // Helper to handle selecting a module
  const handleSelectModule = (modId: string) => {
    setActiveModuleFilter(modId);
    if (modId !== 'all') {
      const mod = MANUAL_MODULES.find((m) => m.id === modId);
      if (mod && activePageNum !== null && !mod.pages.includes(activePageNum)) {
        setActivePageNum(null);
      }
    }
  };

  // Filter pages
  const filteredPages = MANUAL_PAGES.filter((page) => {
    // If a specific page is selected, show that page directly
    if (activePageNum !== null) {
      if (page.pageNumber !== activePageNum) {
        return false;
      }
    } else if (activeModuleFilter !== 'all') {
      // Otherwise filter by module if set
      const mod = MANUAL_MODULES.find((m) => m.id === activeModuleFilter);
      if (mod && !mod.pages.includes(page.pageNumber)) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = page.title.toLowerCase().includes(q);
      const matchText = page.verbatimText.some((line) => line.toLowerCase().includes(q));
      return matchTitle || matchText;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-900">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Verbatim Match Guarantee</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">26 Pages • 12 Modules</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          E-TAX PLANNER Employee Training Manual USA
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed font-normal">
          Full verbatim official source document text without modifying a single word. Browse page by page or practice questions associated with each section.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exact manual text (e.g. W2, 1095, ITIN, 183 days)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Module Selector Dropdown */}
          <div>
            <select
              value={activeModuleFilter}
              onChange={(e) => handleSelectModule(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors font-medium"
            >
              <option value="all">All 12 Modules (Pages 1–26)</option>
              {MANUAL_MODULES.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.title} (Pages {mod.pages.join(', ')})
                </option>
              ))}
            </select>
          </div>

          {/* Page Jumper & Sequential Navigation */}
          <div className="flex items-center space-x-1.5">
            <button
              disabled={activePageNum !== null ? activePageNum <= 1 : false}
              onClick={() => {
                if (activePageNum !== null && activePageNum > 1) {
                  handleSelectPage(activePageNum - 1);
                } else if (activePageNum === null) {
                  handleSelectPage(1);
                }
              }}
              title="Previous Page"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={activePageNum === null ? 'all' : activePageNum}
              onChange={(e) => {
                const val = e.target.value;
                handleSelectPage(val === 'all' ? null : parseInt(val));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors font-medium"
            >
              <option value="all">Jump to Page (All 26 Pages)</option>
              {MANUAL_PAGES.map((p) => (
                <option key={p.pageNumber} value={p.pageNumber}>
                  Page {p.pageNumber}: {p.title}
                </option>
              ))}
            </select>

            <button
              disabled={activePageNum !== null ? activePageNum >= 26 : false}
              onClick={() => {
                if (activePageNum !== null && activePageNum < 26) {
                  handleSelectPage(activePageNum + 1);
                } else if (activePageNum === null) {
                  handleSelectPage(2);
                }
              }}
              title="Next Page"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {(activeModuleFilter !== 'all' || activePageNum !== null || searchQuery !== '') && (
              <button
                onClick={() => {
                  setActiveModuleFilter('all');
                  setActivePageNum(null);
                  setSearchQuery('');
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Page Navigator (Single line smooth arrow-scrolled strip, no scrollbar) */}
        <div className="pt-3 border-t border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-800">Sequential Page Strip:</span>
              <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border border-indigo-200">
                {activePageNum === null ? 'All 26 Pages' : `Page ${activePageNum} of 26`}
              </span>
            </div>

            {activePageNum !== null && (
              <button
                onClick={() => handleSelectPage(null)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold hover:underline transition-all"
              >
                View All Pages (1–26)
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollPills('left')}
              onMouseEnter={() => startHoverScroll('left')}
              onMouseLeave={stopHoverScroll}
              onMouseDown={stopHoverScroll}
              onTouchStart={() => startHoverScroll('left')}
              onTouchEnd={stopHoverScroll}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 transition-colors shrink-0 shadow-xs border border-slate-200 cursor-pointer"
              title="Scroll Previous Pages (Hover or Click)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollPillsRef}
              className="flex items-center space-x-1.5 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                onClick={() => handleSelectPage(null)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all shrink-0 ${
                  activePageNum === null
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                All
              </button>

              {MANUAL_PAGES.map((p) => {
                const isSelected = activePageNum === p.pageNumber;
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      handleSelectPage(isSelected ? null : p.pageNumber);
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-xs transition-all shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-extrabold shadow-md ring-2 ring-indigo-500 ring-offset-1'
                        : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 border border-slate-200 font-semibold'
                    }`}
                    title={`Page ${p.pageNumber}: ${p.title}`}
                  >
                    P{p.pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollPills('right')}
              onMouseEnter={() => startHoverScroll('right')}
              onMouseLeave={stopHoverScroll}
              onMouseDown={stopHoverScroll}
              onTouchStart={() => startHoverScroll('right')}
              onTouchEnd={stopHoverScroll}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 transition-colors shrink-0 shadow-xs border border-slate-200 cursor-pointer"
              title="Scroll Next Pages (Hover or Click)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages Render Stream */}
      <div className="space-y-8">
        {filteredPages.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3 shadow-sm">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-base font-bold text-slate-800">No manual pages match your search query or filter.</p>
            <p className="text-xs text-slate-500">Try searching for terms like "W2", "1095", "183 days", or "CPA".</p>
          </div>
        ) : (
          filteredPages.map((page) => {
            // Find flashcards for this page
            const pageCards = FLASHCARDS_DATA.filter((c) => c.pageNumber === page.pageNumber);

            return (
              <div
                key={page.pageNumber}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0"
              >
                {/* Page Title & Module Header */}
                <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-mono font-bold text-xs">
                      P{page.pageNumber}
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-white">{page.title}</h2>
                      <span className="text-xs text-indigo-300 font-medium">
                        {page.moduleTitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-300 font-medium">
                      {pageCards.length} Questions Available
                    </span>
                    <button
                      onClick={() => setPracticeModalPageNum(page.pageNumber)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Practice Page {page.pageNumber} Questions</span>
                    </button>
                  </div>
                </div>

                {/* Verbatim Source Text Lines */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-2 font-sans text-sm text-slate-800 leading-relaxed">
                    {page.verbatimText.map((paragraph, pIdx) => {
                      if (paragraph.includes(' • ') && paragraph.includes(' - ')) {
                        const items = paragraph.split(' • ');
                        return (
                          <div key={pIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-2">
                            {items.map((item, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-bold shadow-2xs hover:border-indigo-400 hover:text-indigo-700 transition-colors"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <p
                          key={pIdx}
                          className={`p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors ${
                            paragraph.startsWith('•') || paragraph.startsWith('❖')
                              ? 'pl-6 text-slate-900 font-medium bg-slate-100/70'
                              : paragraph.toUpperCase() === paragraph && paragraph.length < 50
                              ? 'font-extrabold text-indigo-900 text-base border-l-4 border-indigo-600 bg-indigo-50/80'
                              : ''
                          }`}
                        >
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* OpenStreetMap & US States Map for Page 2 and Page 3 */}
                  {(page.pageNumber === 2 || page.pageNumber === 3) && <USMapComponent />}
                </div>

                {/* Associated Practice Questions Section */}
                {pageCards.length > 0 && (
                  <div className="bg-slate-50 p-6 border-t border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2 font-bold text-indigo-900">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>Associated Practice Questions & Retention Level:</span>
                      </div>
                      <button
                        onClick={() => setPracticeModalPageNum(page.pageNumber)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Start Practice Session</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pageCards.map((card) => {
                        const prog = cardProgressMap[card.id];
                        const ret = prog ? calculateRetrievability(prog) : 100;

                        return (
                          <div
                            key={card.id}
                            className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900">{card.title}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  prog?.state === 'mastered'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : prog?.state === 'review'
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {prog?.state || 'New'}
                              </span>
                            </div>

                            <p className="text-slate-600 line-clamp-2">{card.prompt}</p>

                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                              <span className="text-slate-500 font-medium">
                                Interval: {prog?.interval || 1}d
                              </span>
                              <span
                                className={`font-extrabold ${
                                  ret >= 80 ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                Retention Level: {ret}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Sequential Page Navigation Footer Bar */}
                <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    disabled={page.pageNumber <= 1}
                    onClick={() => {
                      setActiveModuleFilter('all');
                      setActivePageNum(page.pageNumber - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Page (P{page.pageNumber - 1})</span>
                  </button>

                  <span className="font-mono text-slate-600 font-semibold text-xs">
                    Page {page.pageNumber} of 26
                  </span>

                  <button
                    disabled={page.pageNumber >= 26}
                    onClick={() => {
                      setActiveModuleFilter('all');
                      setActivePageNum(page.pageNumber + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <span>Next Page (P{page.pageNumber + 1})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Page Practice Modal */}
      {practiceModalPageNum !== null && (
        <PagePracticeModal
          pageNumber={practiceModalPageNum}
          pageTitle={
            MANUAL_PAGES.find((p) => p.pageNumber === practiceModalPageNum)?.title ||
            `Page ${practiceModalPageNum}`
          }
          cards={FLASHCARDS_DATA.filter((c) => c.pageNumber === practiceModalPageNum)}
          cardProgressMap={cardProgressMap}
          onSaveReview={onSaveReview}
          onClose={() => setPracticeModalPageNum(null)}
        />
      )}
    </div>
  );
};
