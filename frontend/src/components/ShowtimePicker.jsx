import React, { useState } from 'react';
import { Clock, Zap } from 'lucide-react';

export default function ShowtimePicker({
  selectedTime,
  onSelectTime
}) {
  const [selectedDate, setSelectedDate] = useState('TODAY');

  const dates = [
    { key: 'TODAY', label: 'TODAY', sub: '16 NOV' },
    { key: 'TOMORROW', label: 'TOM', sub: '17 NOV' },
    { key: 'WED', label: 'WED', sub: '18 NOV' },
    { key: 'THU', label: 'THU', sub: '19 NOV' },
  ];

  const timeSlots = [
    { time: '10:30 AM', format: 'IMAX 3D', badge: null },
    { time: '02:15 PM', format: 'IMAX 3D Laser', badge: null },
    { time: '06:45 PM', format: 'IMAX Laser 4K', badge: 'Filling Fast' },
    { time: '09:30 PM', format: 'IMAX 3D Laser', badge: '⚡ Flash Sale', isFlash: true },
    { time: '11:45 PM', format: 'IMAX Laser', badge: null },
  ];

  return (
    <div className="bg-[#0f121d] border border-[#212739] rounded-2xl p-5 mb-8 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c2233] gap-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Select Showtime
          </h2>
        </div>

        {/* Date Selector Tabs */}
        <div className="flex items-center space-x-1.5 bg-[#141825] p-1 rounded-xl border border-[#232a3d]">
          {dates.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDate(d.key)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition text-center ${
                selectedDate === d.key
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                  : 'text-slate-400 hover:text-white hover:bg-[#1b2133]'
              }`}
            >
              <span className="text-[10px] uppercase mr-1">{d.label}</span>
              <span className="text-[11px]">{d.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Showtime Slot Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
        {timeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;

          return (
            <button
              key={slot.time}
              onClick={() => onSelectTime(slot.time)}
              className={`relative p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-0.5 ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/60'
                  : slot.isFlash
                  ? 'bg-[#151927] hover:bg-[#1d2336] border-red-500/40 text-slate-200'
                  : 'bg-[#131622] hover:bg-[#1b2030] border-[#22293c] text-slate-300'
              }`}
            >
              {slot.badge && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded mb-1 ${
                    slot.isFlash
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {slot.badge}
                </span>
              )}
              <div className="text-sm font-extrabold">{slot.time}</div>
              <div className="text-[10px] font-mono text-slate-400">{slot.format}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
