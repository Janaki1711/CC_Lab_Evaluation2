import React from 'react';
import { Sparkles, Clock, Star, Zap, ShieldCheck, Server } from 'lucide-react';

export default function HeroBanner({ showData, selectedTime = "09:30 PM" }) {
  if (!showData) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121520] via-[#161a29] to-[#0f111a] border border-[#232a3d] p-6 sm:p-7 mb-6 shadow-xl">
      {/* Subtle Ambient Red Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left: Movie Details */}
        <div className="space-y-2.5 max-w-2xl">
          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-bold text-[10px] uppercase tracking-wider">
              Flash Sale
            </span>
            <span className="flex items-center text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              {showData.rating || '9.1'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium">
              {showData.screen_name || "IMAX 3D Laser"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {showData.duration || "2h 8m"} ({showData.certification || "UA"})
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {showData.movie_title || "Deadpool & Wolverine"}
          </h1>

          {/* Cinema Hall & Show Timing on One Unbroken Line */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="text-red-400 font-bold">{showData.cinema_hall}</span>
            <span className="text-slate-500">•</span>
            <span className="px-2 py-0.5 rounded bg-[#1b2133] border border-[#2d3752] text-white font-bold font-mono">
              {selectedTime} IST
            </span>
          </div>

          {/* Pricing Row - Clean and Uncongested */}
          <div className="pt-2 flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-400">VIP:</span>
              <strong className="text-white">₹{showData.price_vip}</strong>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="text-slate-400">Premium:</span>
              <strong className="text-white">₹{showData.price_premium}</strong>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-400">Classic:</span>
              <strong className="text-white">₹{showData.price_classic}</strong>
            </div>
          </div>
        </div>

        {/* Right: Clean 3-Metric Architecture Badge */}
        <div className="w-full md:w-auto bg-[#151926]/90 border border-[#262f44] p-4 rounded-xl shadow-inner space-y-2 text-xs font-mono">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-[#22293c]">
            Cloud Placement & Lock Guard
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Lock Engine:</span>
            <strong className="text-emerald-400">Redis 7 (&lt; 4ms)</strong>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Pod Anti-Affinity:</span>
            <strong className="text-cyan-400">3-Node Spread</strong>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Double Bookings:</span>
            <strong className="text-red-400">0 Permitted</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
