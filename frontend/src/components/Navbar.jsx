import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileText, 
  BookOpen, 
  Network, 
  BarChart2, 
  Info, 
  UserCheck, 
  LogOut, 
  LogIn,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onOpenProblemStatement,
  onOpenLoginModal,
  onLogout,
  activeStrategy 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getStrategyLabel = (strat) => {
    if (strat === 'strategy-1-default') return 'Strategy 1: Default';
    if (strat === 'strategy-2-affinity') return 'Strategy 2: Affinity & Anti-Affinity';
    if (strat === 'strategy-3-autoscaling') return 'Strategy 3: HPA + Placement';
    return 'Placement Active';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & University Platform Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  AcademiaCloud
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  K8s Lab 2
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                Intelligent Pod Placement & Distributed File Storage
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setCurrentTab('student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === 'student'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Student Portal
            </button>

            <button
              onClick={() => setCurrentTab('teacher')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === 'teacher'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Faculty Evaluation
            </button>

            <button
              onClick={() => setCurrentTab('topology')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === 'topology'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="relative flex items-center">
                <Network className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              Placement Topology
            </button>

            <button
              onClick={() => setCurrentTab('benchmarks')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === 'benchmarks'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Strategy Comparison
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Problem Statement Pill Button */}
            <button
              onClick={onOpenProblemStatement}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
              title="View Research Problem Statement"
            >
              <Info className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Problem Statement</span>
            </button>

            {/* Current Active Strategy Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>{getStrategyLabel(activeStrategy)}</span>
            </div>

            {/* User Profile / Quick Switcher */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser.username ? currentUser.username[0] : 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.full_name || currentUser.username}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-800">{currentUser.full_name}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{currentUser.email}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        Role: {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      Switch Account (Student / Teacher)
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          <button
            onClick={() => setCurrentTab('student')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              currentTab === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Student Portal
          </button>
          <button
            onClick={() => setCurrentTab('teacher')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              currentTab === 'teacher' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Faculty Evaluation
          </button>
          <button
            onClick={() => setCurrentTab('topology')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              currentTab === 'topology' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Placement Topology
          </button>
          <button
            onClick={() => setCurrentTab('benchmarks')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
              currentTab === 'benchmarks' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Strategy Comparison
          </button>
        </div>

      </div>
    </header>
  );
}
