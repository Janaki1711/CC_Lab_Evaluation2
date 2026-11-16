import React from 'react';
import { Film, Zap, RotateCcw, Ticket, Server, ChevronDown } from 'lucide-react';

export default function Navbar({
  currentUser,
  onOpenLogin,
  availableSeatsCount,
  totalSeatsCount,
  onOpenFlashSale,
  onResetTheater,
  onOpenTickets,
  onOpenTopology,
  userTicketsCount,
  isResetting
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0e15]/95 backdrop-blur-md border-b border-[#1f2536] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-white">
                book<span className="text-red-600">my</span>show
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/70 text-red-400 border border-red-800/40 tracking-wider">
                Flash Sale
              </span>
            </div>
          </div>

          {/* Center: Clean Live Availability Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#131724] border border-[#232a3d] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Available:</span>
            <span className="font-extrabold text-emerald-400">
              {availableSeatsCount} / {totalSeatsCount}
            </span>
          </div>

          {/* Right: Actions & User Persona */}
          <div className="flex items-center space-x-3">
            {/* 500-User Rush Action Button */}
            <button
              onClick={onOpenFlashSale}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/60 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>500-User Rush</span>
            </button>

            {/* User Persona Pill */}
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-2 bg-[#131724] hover:bg-[#1a2032] px-2.5 py-1.5 rounded-xl border border-[#232a3d] transition-all text-left"
              title="Switch user account"
            >
              <div className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold text-[11px] flex items-center justify-center">
                {currentUser?.name ? currentUser.name[0] : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight flex items-center space-x-1">
                  <span>{currentUser?.name || 'Sign In'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </button>

            {/* Quick Action Icons Group */}
            <div className="flex items-center space-x-1 pl-1 border-l border-[#20273a]">
              {/* Reset Theater */}
              <button
                onClick={onResetTheater}
                disabled={isResetting}
                title="Reset all seats and Redis locks"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1b2234] transition"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-red-500' : ''}`} />
              </button>

              {/* My Tickets */}
              <button
                onClick={onOpenTickets}
                title="My Booked Tickets"
                className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1b2234] transition"
              >
                <Ticket className="w-4 h-4" />
                {userTicketsCount > 0 && (
                  <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-red-600"></span>
                )}
              </button>

              {/* Topology Visualizer */}
              <button
                onClick={onOpenTopology}
                title="Kubernetes Topology & Placement"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-[#1b2234] transition"
              >
                <Server className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
