import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  BarChart3,
  Flame,
  Clock,
  Sparkles,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dueCardsCount: number;
  streakDays: number;
  avgRetrievability: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  dueCardsCount,
  streakDays,
  avgRetrievability,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'review',
      label: 'Daily Review',
      icon: Sparkles,
      badge: dueCardsCount > 0 ? dueCardsCount : undefined,
    },
    { id: 'manual-lib', label: 'Training Manual', icon: BookOpen },
    { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
    { id: 'analytics', label: 'Learning Progress', icon: BarChart3 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">E-TAX PLANNER</span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  USA
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Employee Training & Learning Portal
              </p>
            </div>
          </div>

          {/* Center/Right Metrics (Desktop) */}
          <div className="hidden xl:flex items-center space-x-3 text-xs font-semibold">
            {/* Streak */}
            <div
              className="flex items-center space-x-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80 text-amber-900"
              title="Active Daily Streak"
            >
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500/30" />
              <span>Streak:</span>
              <span className="font-extrabold text-amber-700">{streakDays}d</span>
            </div>

            {/* Retention Level */}
            <div
              className="flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80 text-emerald-900"
              title="Overall Retention Level"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Retention:</span>
              <span className="font-extrabold text-emerald-700">{avgRetrievability}%</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-black bg-amber-400 text-slate-950 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Toggle Menu Button (Mobile & Tablet) */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* Quick Metrics Bar in Toggle Menu */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 text-amber-800">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500/30" />
              <span>Streak: {streakDays} Days</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-800">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Retention: {avgRetrievability}%</span>
            </div>
          </div>

          {/* Nav Links List */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-extrabold bg-amber-400 text-slate-950 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

