import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Zap, Check } from 'lucide-react';

export default function ShowtimePicker({
  show,
  selectedTime,
  onSelectTime,
  onOpenFlashSale
}) {
  const [selectedDate, setSelectedDate] = useState('TODAY');

  const dates = [
    { key: 'TODAY', label: 'TODAY', sub: '16 NOV', active: true },
    { key: 'TOMORROW', label: 'TOM', sub: '17 NOV', active: false },
    { key: 'WED', label: 'WED', sub: '18 NOV', active: false },
    { key: 'THU', label: 'THU', sub: '19 NOV', active: false },
  ];

  const timeSlots = [
    { time: '10:30 AM', type: 'Morning Show', format: 'IMAX 3D • Dolby Atmos', status: 'AVAILABLE', statusColor: 'text-emerald-400', badge: 'Fast Filling' },
    { time: '02:15 PM', type: 'Matinee', format: 'IMAX 3D Laser', status: 'AVAILABLE', statusColor: 'text-emerald-400', badge: null },
    { time: '06:45 PM', type: 'Prime Evening', format: 'IMAX Laser 4K', status: 'ALMOST_FULL', statusColor: 'text-amber-400', badge: 'Almost Full' },
    { time: '09:30 PM', type: '⚡ Flash-Sale Prime', format: 'IMAX 3D • Dolby 7.1', status: 'FLASH_SALE', statusColor: 'text-red-400', badge: 'Rush Live 🔥', isFlash: true },
    { time: '11:45 PM', type: 'Late Night', format: 'IMAX Laser Experience', status: 'AVAILABLE', statusColor: 'text-emerald-400', badge: null },
  ];

  return (
    <div className="bg-[#10131d] border border-[#232a3d] rounded-2xl p-5 sm:p-6 mb-8 shadow-xl">
      {/* Date & Hall Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-[#212739] gap-4">
        {/* Cinema Hall & Format */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>{show?.cinema_hall || "PVR Director's Cut - Audi 4"}</span>
          </div>
          <p className="text-xs text-slate-400 font-mono flex items-center space-x-2">
            <span>Screen: <strong className="text-slate-200">{show?.screen_name || "IMAX 3D Laser"}</strong></span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{show?.language || "English • 3D"}</span>
          </p>
        </div>

        {/* Date Selector Tabs */}
        <div className="flex items-center space-x-2 bg-[#161a27] p-1 rounded-xl border border-[#262e44]">
          {dates.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDate(d.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-center ${
                selectedDate === d.key
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-white hover:bg-[#1f2538]'
              }`}
            >
              <div className="text-[10px] uppercase">{d.label}</div>
              <div className="text-xs font-black">{d.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Showtime Slot Pills */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Select Showtime Slot:</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            All timings in Indian Standard Time (IST)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {timeSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;

            return (
              <button
                key={slot.time}
                onClick={() => onSelectTime(slot.time)}
                className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-600/90 to-red-800/90 border-red-400 text-white shadow-xl shadow-red-950/60 ring-2 ring-red-400'
                    : slot.isFlash
                    ? 'bg-[#181b29] hover:bg-[#202538] border-red-500/50 hover:border-red-400 text-slate-200 shadow-md'
                    : 'bg-[#141825] hover:bg-[#1c2234] border-[#262f44] hover:border-slate-500 text-slate-300'
                }`}
              >
                {/* Flash Badge */}
                {slot.badge && (
                  <span
                    className={`absolute -top-2 right-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm ${
                      slot.isFlash
                        ? 'bg-red-600 text-white border border-red-400 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                    }`}
                  >
                    {slot.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-base font-black font-mono tracking-tight ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                    {slot.time}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </div>

                <div className="space-y-0.5 text-[10px] font-mono">
                  <div className={isSelected ? 'text-red-100' : 'text-slate-400 font-semibold'}>
                    {slot.format}
                  </div>
                  <div className={isSelected ? 'text-red-200' : slot.statusColor}>
                    {slot.type}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
