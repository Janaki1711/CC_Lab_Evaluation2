import React from 'react';
import { Ticket, Film, Calendar, Clock, MapPin, CheckCircle2, X, Download } from 'lucide-react';

export default function TicketPassModal({ isOpen, onClose, ticketData }) {
  if (!isOpen || !ticketData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111420] border border-[#2e374f] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Ticket className="w-5 h-5 text-white" />
            <span className="text-xl font-black tracking-tight">book<span className="text-yellow-300">my</span>show</span>
          </div>
          <p className="text-[11px] font-mono tracking-widest uppercase text-red-100">
            CONFIRMED E-TICKET PASS
          </p>
        </div>

        {/* Perforated Cut Line */}
        <div className="relative flex items-center justify-between px-3 bg-[#111420]">
          <div className="w-6 h-6 rounded-full bg-black -ml-6 border-r border-[#2e374f]"></div>
          <div className="flex-1 border-b-2 border-dashed border-[#2e374f] mx-2"></div>
          <div className="w-6 h-6 rounded-full bg-black -mr-6 border-l border-[#2e374f]"></div>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-5 bg-[#111420]">
          {/* Movie Title */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-red-400 tracking-wider">
              IMAX 3D Laser • Dolby Atmos
            </span>
            <h3 className="text-2xl font-black text-white leading-tight mt-0.5">
              {ticketData.movie_title || "Deadpool & Wolverine"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span>{ticketData.cinema_hall || "PVR Director's Cut - Audi 4"}</span>
            </p>
          </div>

          {/* Time & Screen Info */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#171b2b] border border-[#283147] font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px]">DATE & SHOWTIME</span>
              <div className="text-slate-200 font-bold mt-0.5">Today • 09:30 PM</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">TICKETS / SEATS</span>
              <div className="text-emerald-400 font-bold mt-0.5">
                {ticketData.seat_numbers} ({ticketData.seats_count || 1})
              </div>
            </div>
          </div>

          {/* Booking & Payment Metadata */}
          <div className="space-y-1.5 font-mono text-xs border-t border-[#232a3e] pt-4">
            <div className="flex justify-between text-slate-400">
              <span>Booking Reference:</span>
              <span className="text-white font-bold">{ticketData.booking_ref}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Reference:</span>
              <span className="text-slate-300">{ticketData.payment_ref}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Booked By:</span>
              <span className="text-slate-300">{ticketData.user_name}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-[#232a3e]">
              <span className="font-bold text-slate-300">Total Amount Paid:</span>
              <span className="text-base font-black text-red-400">₹{ticketData.total_amount}</span>
            </div>
          </div>

          {/* Realistic QR Code Graphic */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-slate-900 space-y-2">
            <svg className="w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
              {/* Corner 1 */}
              <rect x="10" y="10" width="24" height="24" fill="#000" />
              <rect x="14" y="14" width="16" height="16" fill="#fff" />
              <rect x="18" y="18" width="8" height="8" fill="#000" />
              {/* Corner 2 */}
              <rect x="66" y="10" width="24" height="24" fill="#000" />
              <rect x="70" y="14" width="16" height="16" fill="#fff" />
              <rect x="74" y="18" width="8" height="8" fill="#000" />
              {/* Corner 3 */}
              <rect x="10" y="66" width="24" height="24" fill="#000" />
              <rect x="14" y="70" width="16" height="16" fill="#fff" />
              <rect x="18" y="74" width="8" height="8" fill="#000" />
              {/* Inner Dots */}
              <rect x="42" y="12" width="6" height="6" />
              <rect x="52" y="18" width="6" height="6" />
              <rect x="42" y="30" width="12" height="6" />
              <rect x="12" y="42" width="6" height="12" />
              <rect x="24" y="48" width="6" height="6" />
              <rect x="40" y="44" width="8" height="8" fill="#e50914" />
              <rect x="54" y="40" width="6" height="6" />
              <rect x="66" y="46" width="12" height="6" />
              <rect x="44" y="66" width="6" height="12" />
              <rect x="56" y="62" width="12" height="6" />
              <rect x="76" y="66" width="8" height="8" />
              <rect x="68" y="80" width="16" height="6" />
              <rect x="42" y="82" width="6" height="6" />
            </svg>
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
              Scan at Audi 4 Turnstile
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0d0f17] border-t border-[#232a3e] flex items-center justify-between">
          <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Double-Booking Confirmed</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
