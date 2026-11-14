import React, { useState } from 'react';
import { 
  Shield, 
  Layers, 
  Info, 
  ChevronDown, 
  UserCheck, 
  LogOut, 
  Server,
  Building2,
  HardDrive
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  onOpenProblemStatement, 
  onOpenLoginModal, 
  onLogout, 
  activeStrategy 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getStrategyLabel = (strat) => {
    if (strat === 'strategy-1-default') return 'Strategy 1: Default Baseline';
    if (strat === 'strategy-2-affinity') return 'Strategy 2: Affinity & Anti-Affinity';
    if (strat === 'strategy-3-autoscaling') return 'Strategy 3: HPA Scaled';
    return 'Placement Active';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between select-none">
      
      {/* Left: Organization Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Acme Global Enterprises</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">Production Vault Cluster</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        
        {/* Research Problem Statement Button */}
        <button
          onClick={onOpenProblemStatement}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
        >
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Research Problem Statement</span>
        </button>

        {/* Active Placement Strategy Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 text-indigo-800 border border-indigo-200/80 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>{getStrategyLabel(activeStrategy)}</span>
        </div>

        {/* User Profile / Account Switcher */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                {currentUser.username ? currentUser.username[0] : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.full_name || currentUser.username}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {currentUser.department?.split(' ')[0] || 'Enterprise'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{currentUser.full_name}</div>
                  <div className="text-slate-400 text-[11px] font-mono">{currentUser.email}</div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    Role: {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenLoginModal();
                  }}
                  className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  Switch Enterprise Persona
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium border-t border-slate-100 mt-1"
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
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Sign In
          </button>
        )}

      </div>
    </header>
  );
}
