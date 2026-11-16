import React from 'react';
import { Ticket, X, MapPin, Calendar, Clock, CreditCard } from 'lucide-react';

export default function MyTicketsModal({ isOpen, onClose, tickets, onViewTicket }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f121d] border border-[#2b334a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#252c3f] bg-gradient-to-r from-red-950/40 via-[#141824] to-[#0f121d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">My Confirmed Tickets</h2>
              <p className="text-xs text-slate-400 font-mono">
                {tickets.length} active cinema booking pass{tickets.length === 1 ? '' : 'es'}
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="py-12 text-center space-y-3 font-mono">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto stroke-[1.5]" />
              <div className="text-slate-300 font-bold">No Bookings Yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select available seats on the theater matrix and click "Confirm & Book Tickets" to generate your first pass!
              </p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id || t.booking_ref}
                onClick={() => onViewTicket(t)}
                className="p-4 rounded-xl bg-[#141826] hover:bg-[#1a2033] border border-[#262e44] hover:border-red-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-red-400">
                      {t.booking_ref}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 font-mono uppercase">
                      CONFIRMED
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {t.movie_title || "Deadpool & Wolverine (IMAX 3D)"}
                  </h4>
                  <div className="text-xs text-slate-400 flex items-center space-x-3 font-mono">
                    <span>Seats: <strong className="text-emerald-400">{t.seat_numbers}</strong></span>
                    <span>•</span>
                    <span>Paid: <strong className="text-white">₹{t.total_amount}</strong></span>
                  </div>
                </div>

                <div className="text-right w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewTicket(t);
                    }}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-red-600/20 group-hover:bg-red-600 border border-red-500/40 text-red-300 group-hover:text-white font-mono text-xs font-bold transition-all"
                  >
                    View E-Ticket Pass →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c0f17] border-t border-[#252c3f] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#171b29] hover:bg-[#20273a] text-slate-300 hover:text-white font-mono text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
