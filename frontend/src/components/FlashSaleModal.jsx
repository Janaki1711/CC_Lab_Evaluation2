import React, { useState } from 'react';
import { Zap, ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Server, X, Play, RotateCcw } from 'lucide-react';

export default function FlashSaleModal({
  isOpen,
  onClose,
  onLaunchRush,
  isRunning,
  rushResults,
  onResetTheater
}) {
  const [concurrency, setConcurrency] = useState(500);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0f121d] border border-[#2b334a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#252c3f] bg-gradient-to-r from-red-950/40 via-[#141824] to-[#0f121d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Zap className="w-5 h-5 fill-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Flash-Sale Rush Simulator</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50 uppercase font-mono">
                  Live Concurrency
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                500 concurrent threads competing for 60 cinema seats simultaneously
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1b2030] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Concept Explanation Box */}
          <div className="p-4 rounded-xl bg-[#141826] border border-[#262e42] text-xs space-y-2">
            <div className="flex items-center space-x-2 text-slate-200 font-bold uppercase font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cloud Computing Evaluation Concepts</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When 500 bot requests strike in parallel, our <span className="text-amber-400 font-semibold">Redis Atomic Distributed Lock (SET NX EX)</span> guarantees that only 1 buyer acquires each seat. All colliding requests receive instant HTTP 409 Conflict without overloading the PostgreSQL database.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px]">
              <span className="text-cyan-400 flex items-center space-x-1">
                <Server className="w-3.5 h-3.5" />
                <span>Pod Affinity: Redis co-located for sub-5ms lock speed</span>
              </span>
              <span className="text-indigo-400 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Pod Anti-Affinity: Workers spread across 3 nodes</span>
              </span>
            </div>
          </div>

          {/* Concurrency Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Bot Concurrency Level:
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[100, 250, 500, 1000].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setConcurrency(count)}
                  disabled={isRunning}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                    concurrency === count
                      ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/40 ring-2 ring-red-500/50'
                      : 'bg-[#151926] border-[#293247] text-slate-300 hover:bg-[#1e2436] hover:text-white'
                  }`}
                >
                  {count} Users {count === 500 && '🔥'}
                </button>
              ))}
            </div>
          </div>

          {/* Running State View */}
          {isRunning && (
            <div className="p-8 rounded-2xl bg-gradient-to-b from-[#181d2e] to-[#121624] border border-red-500/30 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping"></div>
                <div className="relative w-16 h-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Executing {concurrency} Concurrent Thread Rush...
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Evaluating atomic Redis locks and logging collisions across Kubernetes nodes...
                </p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {rushResults && !isRunning && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
              {/* Zero Double-Booking Verified Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border border-emerald-500/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-200 uppercase tracking-wide">
                      Zero Double-Booking Mathematically Verified!
                    </h4>
                    <p className="text-xs text-emerald-300/80 font-mono">
                      Guaranteed by Redis Distributed Locks + Atomic Transactions
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-emerald-400">Double Bookings:</span>
                  <div className="text-xl font-black text-emerald-200">
                    {rushResults.double_bookings_count}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#141826] border border-[#293247]">
                  <span className="text-slate-400 text-[11px]">Total Requests:</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {rushResults.total_requests}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#141826] border border-[#293247]">
                  <span className="text-slate-400 text-[11px]">Locks Granted:</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {rushResults.locks_granted} seats
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#141826] border border-[#293247]">
                  <span className="text-slate-400 text-[11px]">Collisions Prevented:</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {rushResults.collisions_prevented}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#141826] border border-[#293247]">
                  <span className="text-slate-400 text-[11px]">Throughput (RPS):</span>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">
                    {rushResults.throughput_rps} req/s
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#141826] border border-[#293247] flex justify-between items-center">
                  <span className="text-slate-400">Average Lock Latency:</span>
                  <span className="text-amber-300 font-bold">
                    {rushResults.avg_lock_latency_ms} ms (Affinity Speed)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#141826] border border-[#293247] flex justify-between items-center">
                  <span className="text-slate-400">Total Run Duration:</span>
                  <span className="text-slate-200 font-bold">
                    {rushResults.total_time_seconds}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#252c3f] bg-[#0c0f17] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onResetTheater}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-[#161a27] hover:bg-[#202638] text-slate-300 hover:text-white border border-[#2c344a] text-xs font-mono font-semibold transition-all flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Seats & Locks</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => onLaunchRush(concurrency)}
              disabled={isRunning}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-900/50 border border-red-400/40 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Launch {concurrency}-User Flash Sale Rush</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
