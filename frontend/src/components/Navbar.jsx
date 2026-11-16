import React from 'react';
import { Film, Zap, RotateCcw, Ticket, Server, ShieldCheck, User } from 'lucide-react';

export default function Navbar({
  currentUser,
  setCurrentUser,
  availableSeatsCount,
  totalSeatsCount,
  onOpenFlashSale,
  onResetTheater,
  onOpenTickets,
  onOpenTopology,
  userTicketsCount,
  isResetting
}) {
  const demoUsers = [
    { id: 'user_alex_101', name: 'Alex Kumar', role: 'Buyer 1' },
    { id: 'user_sarah_202', name: 'Sarah Jenkins', role: 'Buyer 2' },
    { id: 'user_sharma_303', name: 'Prof. Sharma', role: 'Faculty / Evaluator' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e15]/95 backdrop-blur-md border-b border-[#222838] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-900/40 border border-red-400/30">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  book<span className="text-red-500">my</span>show
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-700/50 uppercase tracking-wider">
                  Flash Sale Rush
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Distributed Lock Engine (Redis 7 + K8s Affinity)</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & User Switcher */}
          <div className="hidden lg:flex items-center space-x-4 text-xs font-mono">
            {/* Inventory Pill */}
            <div className="px-3 py-1.5 rounded-lg bg-[#141724] border border-[#2a3044] text-slate-300 flex items-center space-x-2">
              <span className="text-slate-400">Available:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {availableSeatsCount} / {totalSeatsCount}
              </span>
            </div>

            {/* Distributed Lock Pill */}
            <div className="px-3 py-1.5 rounded-lg bg-[#141724] border border-[#2a3044] text-slate-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span className="text-slate-400">Lock Guarantee:</span>
              <span className="font-bold text-amber-400">Zero Double-Booking</span>
            </div>

            {/* User Selector for Side-by-Side Demo */}
            <div className="flex items-center space-x-2 bg-[#141724] p-1 rounded-lg border border-[#2a3044]">
              <User className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const selected = demoUsers.find((u) => u.id === e.target.value);
                  if (selected) setCurrentUser(selected);
                }}
                className="bg-transparent text-white font-sans text-xs focus:outline-none pr-2 py-1 cursor-pointer font-medium"
              >
                {demoUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#12151e] text-white">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Showstopper Flash Sale Rush CTA */}
            <button
              onClick={onOpenFlashSale}
              className="relative group overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-700/30 border border-red-400/40 transition-all transform active:scale-95 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
              <span className="tracking-wide">500-User Rush</span>
            </button>

            {/* Reset Theater */}
            <button
              onClick={onResetTheater}
              disabled={isResetting}
              title="Reset all seats and Redis locks"
              className="p-2 sm:p-2.5 rounded-xl bg-[#151825] hover:bg-[#1e2336] text-slate-300 hover:text-white border border-[#2a3044] transition-all"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-red-400' : ''}`} />
            </button>

            {/* My Tickets */}
            <button
              onClick={onOpenTickets}
              className="relative p-2 sm:p-2.5 rounded-xl bg-[#151825] hover:bg-[#1e2336] text-slate-300 hover:text-white border border-[#2a3044] transition-all"
              title="My Booked Tickets"
            >
              <Ticket className="w-4 h-4 text-red-400" />
              {userTicketsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {userTicketsCount}
                </span>
              )}
            </button>

            {/* K8s Topology */}
            <button
              onClick={onOpenTopology}
              className="p-2 sm:p-2.5 rounded-xl bg-[#151825] hover:bg-[#1e2336] text-slate-300 hover:text-white border border-[#2a3044] transition-all hidden sm:block"
              title="Kubernetes Placement & Affinity Topology"
            >
              <Server className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
