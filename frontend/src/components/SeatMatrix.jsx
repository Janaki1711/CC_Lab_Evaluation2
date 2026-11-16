import React from 'react';
import { Crown, Lock, Check, Sparkles } from 'lucide-react';

export default function SeatMatrix({
  seats,
  selectedSeats,
  onSeatClick,
  currentUserId,
  isLoading
}) {
  // Group seats by row
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsByRow = rows.reduce((acc, r) => {
    acc[r] = seats.filter((s) => s.row_char === r);
    return acc;
  }, {});

  const getSeatStatusClass = (seat) => {
    const isSelectedByMe = selectedSeats.includes(seat.seat_number);

    if (seat.status === 'BOOKED') {
      return 'bg-gradient-to-b from-red-900/80 to-red-950/90 border-red-800/80 text-red-300/60 cursor-not-allowed shadow-inner';
    }

    if (isSelectedByMe) {
      return 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-300 text-white font-black shadow-lg shadow-emerald-900/50 scale-105 ring-2 ring-emerald-400';
    }

    if (seat.status === 'LOCKED') {
      // Locked by someone else
      return 'bg-gradient-to-b from-amber-600/90 to-amber-800/90 border-amber-400 text-white animate-pulse-slow shadow-lg shadow-amber-900/40 cursor-not-allowed';
    }

    // Available
    if (seat.tier === 'VIP') {
      return 'bg-[#181d2c] hover:bg-[#22293e] border-amber-500/40 hover:border-amber-400 text-amber-200 hover:scale-105 cursor-pointer shadow-md shadow-black/40';
    } else if (seat.tier === 'PREMIUM') {
      return 'bg-[#151926] hover:bg-[#1f2538] border-indigo-500/30 hover:border-indigo-400 text-slate-200 hover:scale-105 cursor-pointer shadow-md shadow-black/40';
    } else {
      return 'bg-[#131622] hover:bg-[#1c2132] border-[#293147] hover:border-red-500/50 text-slate-300 hover:scale-105 cursor-pointer shadow-sm';
    }
  };

  return (
    <div className="bg-[#0f121b] border border-[#23293c] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Curved Screen Visualization */}
      <div className="relative mb-14 text-center">
        <div className="w-full max-w-3xl mx-auto h-12 relative flex items-center justify-center">
          {/* Curved Screen Arc SVG */}
          <svg className="w-full h-12 overflow-visible" viewBox="0 0 800 60" fill="none">
            <defs>
              <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.2" />
                <stop offset="30%" stopColor="#dc2626" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#dc2626" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.2" />
              </linearGradient>
              <filter id="screenGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path
              d="M 20 45 Q 400 5 780 45"
              stroke="url(#screenGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#screenGlow)"
            />
          </svg>
        </div>

        {/* Screen Ambient Downlight */}
        <div className="w-3/4 mx-auto h-8 -mt-5 bg-gradient-to-b from-red-500/20 via-red-600/5 to-transparent blur-md pointer-events-none"></div>

        <p className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold mt-1">
          ALL EYES THIS WAY • CURVED IMAX 3D SCREEN
        </p>
      </div>

      {/* Seat Rows Matrix */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {rows.map((r) => {
          const rowSeats = seatsByRow[r] || [];
          const tier = r === 'A' ? 'VIP RECLINER (₹800)' : r === 'B' || r === 'C' ? 'PREMIUM CLUB (₹500)' : 'CLASSIC LOUNGE (₹350)';

          return (
            <div key={r} className="space-y-2">
              {/* Row Category Header on Row A, B, D */}
              {(r === 'A' || r === 'B' || r === 'D') && (
                <div className="flex items-center space-x-3 pt-2 pb-1 border-b border-[#212739]/60">
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center space-x-1.5">
                    {r === 'A' && <Crown className="w-3.5 h-3.5 text-amber-400 inline" />}
                    <span>{tier}</span>
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                {/* Row Letter Identifier */}
                <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                  {r}
                </span>

                {/* Seat Columns 1 to 10 */}
                <div className="flex items-center space-x-1.5 sm:space-x-2.5">
                  {rowSeats.map((seat, idx) => {
                    const isSelected = selectedSeats.includes(seat.seat_number);
                    const isLockedByOther = seat.status === 'LOCKED' && !isSelected;
                    const isBooked = seat.status === 'BOOKED';

                    return (
                      <React.Fragment key={seat.id || seat.seat_number}>
                        {/* Aisle gap between col 5 and col 6 */}
                        {idx === 5 && <div className="w-3 sm:w-6"></div>}

                        <button
                          onClick={() => onSeatClick(seat)}
                          disabled={isBooked || isLockedByOther || isLoading}
                          title={
                            isBooked
                              ? `Seat ${seat.seat_number}: SOLD OUT (${seat.booked_by || 'Confirmed'})`
                              : isLockedByOther
                              ? `Seat ${seat.seat_number}: LOCKED by ${seat.locked_by || 'another buyer'} (${seat.ttl_remaining}s remaining)`
                              : isSelected
                              ? `Seat ${seat.seat_number}: Selected by you! (Lock active)`
                              : `Seat ${seat.seat_number}: Available - ₹${seat.price}`
                          }
                          className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg border text-[11px] sm:text-xs font-mono font-semibold transition-all duration-200 flex flex-col items-center justify-center ${getSeatStatusClass(
                            seat
                          )}`}
                        >
                          {/* Inner Content */}
                          {isBooked ? (
                            <span className="text-[10px] text-red-400/80 font-bold">✕</span>
                          ) : isSelected ? (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          ) : isLockedByOther ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-300" />
                              {seat.ttl_remaining > 0 && (
                                <span className="text-[9px] font-bold text-amber-200 leading-none mt-0.5">
                                  {seat.ttl_remaining}s
                                </span>
                              )}
                            </>
                          ) : (
                            <span>{seat.col_num}</span>
                          )}

                          {/* VIP Crown Mini Badge */}
                          {seat.tier === 'VIP' && !isBooked && !isSelected && !isLockedByOther && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
                          )}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Identifier */}
                <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                  {r}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat Status Legend */}
      <div className="mt-12 pt-6 border-t border-[#23293c] flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-[#161b28] border border-[#2b334a]"></div>
          <span className="text-slate-400">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-400 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-emerald-300 font-semibold">Your Lock (60s hold)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-amber-600 border border-amber-400 animate-pulse flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-amber-200" />
          </div>
          <span className="text-amber-300 font-semibold">Locked by Others (Redis TTL)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-red-950 border border-red-800 flex items-center justify-center text-[10px] text-red-400">
            ✕
          </div>
          <span className="text-red-400 font-semibold">Booked / Sold Out</span>
        </div>
        <div className="flex items-center space-x-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 font-semibold">VIP Recliner (Row A)</span>
        </div>
      </div>
    </div>
  );
}
