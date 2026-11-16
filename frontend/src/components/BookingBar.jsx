import React from 'react';
import { CreditCard, Clock, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function BookingBar({
  selectedSeats,
  seatsData,
  onReleaseAll,
  onProceedBooking,
  isBooking,
  lockSecondsRemaining
}) {
  if (selectedSeats.length === 0) return null;

  // Calculate total price
  const selectedSeatObjs = seatsData.filter((s) => selectedSeats.includes(s.seat_number));
  const totalPrice = selectedSeatObjs.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e111a]/95 backdrop-blur-xl border-t border-[#293147] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] py-4 px-4 sm:px-8 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Selected Seats Details */}
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-1.5 max-w-md">
            <span className="text-xs font-mono text-slate-400 mr-2">Seats Selected:</span>
            {selectedSeatObjs.map((s) => (
              <span
                key={s.seat_number}
                className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 font-mono font-bold text-xs flex items-center space-x-1"
              >
                <span>{s.seat_number}</span>
                <span className="text-[10px] text-emerald-400/70">({s.tier})</span>
              </span>
            ))}
          </div>

          {/* Redis Lock Timer */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Lock:</span>
            <span className="font-black text-amber-200">
              {lockSecondsRemaining > 0 ? `${lockSecondsRemaining}s` : 'Expiring'}
            </span>
          </div>
        </div>

        {/* Right: Price & Confirm Actions */}
        <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto">
          {/* Price Calculation */}
          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">Total Amount:</div>
            <div className="text-2xl font-black text-white font-mono flex items-center justify-end space-x-1">
              <span className="text-red-500 text-lg">₹</span>
              <span>{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Release Button */}
          <button
            onClick={onReleaseAll}
            disabled={isBooking}
            className="px-3 py-2 rounded-xl bg-[#161a27] hover:bg-[#202638] text-slate-400 hover:text-white border border-[#2c344a] text-xs font-semibold transition-all flex items-center space-x-1"
            title="Release lock and cancel"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Release</span>
          </button>

          {/* Confirm & Book */}
          <button
            onClick={onProceedBooking}
            disabled={isBooking}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-red-900/50 border border-red-400/40 transition-all transform active:scale-95 flex items-center space-x-2"
          >
            {isBooking ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Securing Ticket...</span>
              </span>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-white" />
                <span>Confirm & Book Tickets</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
