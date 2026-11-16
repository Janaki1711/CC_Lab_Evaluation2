import React from 'react';
import { Sparkles, Clock, Volume2, ShieldAlert, Cpu, Star } from 'lucide-react';

export default function HeroBanner({ showData, selectedTime = "09:30 PM" }) {
  if (!showData) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121520] via-[#161a29] to-[#0f111a] border border-[#262c3e] shadow-2xl p-6 sm:p-8 mb-6">
      {/* Background Red Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-rose-600/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Movie Details */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-md shadow-red-900/50">
              ⚡ Flash Sale Active
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1c2233] text-amber-300 border border-[#2e374f]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
              {showData.rating || '9.1'} IMDb Rating
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1c2233] text-slate-300 border border-[#2e374f]">
              <Sparkles className="w-3 h-3 text-cyan-400 mr-1" />
              {showData.screen_name || "IMAX 3D Laser"}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1c2233] text-slate-300 border border-[#2e374f]">
              <Clock className="w-3 h-3 text-rose-400 mr-1" />
              {showData.duration || "2h 8m"} • {showData.certification || "UA"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {showData.movie_title || "Deadpool & Wolverine (IMAX 3D)"}
          </h1>

          <div className="text-sm sm:text-base text-slate-300 flex flex-wrap items-center gap-2 font-mono">
            <span className="text-red-400 font-semibold">{showData.cinema_hall}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Selected Show:</span>
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-600/50 text-white font-bold">
              {selectedTime} IST
            </span>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2 bg-[#1a1f30] px-3 py-1.5 rounded-lg border border-[#2d364f]">
              <span className="text-amber-400 font-bold">VIP Recliner:</span>
              <span className="text-white font-black text-sm">₹{showData.price_vip}</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a1f30] px-3 py-1.5 rounded-lg border border-[#2d364f]">
              <span className="text-indigo-400 font-bold">Premium Club:</span>
              <span className="text-white font-black text-sm">₹{showData.price_premium}</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a1f30] px-3 py-1.5 rounded-lg border border-[#2d364f]">
              <span className="text-slate-400 font-bold">Classic:</span>
              <span className="text-white font-black text-sm">₹{showData.price_classic}</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Guarantee Card */}
        <div className="w-full md:w-auto bg-[#171b28]/90 border border-[#2d354b] p-4 rounded-xl shadow-inner space-y-2.5 font-mono text-xs">
          <div className="text-slate-400 flex items-center space-x-1.5 border-b border-[#283044] pb-2 font-bold uppercase tracking-wider text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            <span>Concurrency & Lock Guard</span>
          </div>
          <div className="flex justify-between items-center space-x-6">
            <span className="text-slate-400">Lock Engine:</span>
            <span className="text-emerald-400 font-bold">Redis 7 (Atomic SET NX)</span>
          </div>
          <div className="flex justify-between items-center space-x-6">
            <span className="text-slate-400">Lock TTL Window:</span>
            <span className="text-amber-400 font-bold">60 Seconds Hold</span>
          </div>
          <div className="flex justify-between items-center space-x-6">
            <span className="text-slate-400">Race Condition Guard:</span>
            <span className="text-red-400 font-bold">Zero Double-Booking</span>
          </div>
          <div className="flex justify-between items-center space-x-6">
            <span className="text-slate-400">Pod Placement:</span>
            <span className="text-cyan-400 font-bold">K8s Affinity Co-Located</span>
          </div>
        </div>
      </div>
    </div>
  );
}
