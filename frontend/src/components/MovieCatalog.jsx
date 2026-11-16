import React from 'react';
import { Star, Film, Sparkles, Clock, Check, ChevronRight } from 'lucide-react';

export default function MovieCatalog({
  shows,
  selectedShowId,
  onSelectShow,
  isLoading
}) {
  if (!shows || shows.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Film className="w-5 h-5 text-red-500" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Now Showing in Theaters
          </h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#1a1f30] text-slate-300 border border-[#2b344d]">
            {shows.length} Blockbusters Available
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          Select a movie to view live seat availability & flash sale status
        </span>
      </div>

      {/* Movie Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {shows.map((show) => {
          const isSelected = show.id === selectedShowId;

          return (
            <div
              key={show.id}
              onClick={() => onSelectShow(show)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1c2236] to-[#121624] border-red-500 shadow-2xl shadow-red-950/60 ring-2 ring-red-500/60 scale-[1.02]'
                  : 'bg-[#121520] hover:bg-[#181d2c] border-[#252c3f] hover:border-slate-500 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Active Movie Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 shadow-lg shadow-red-950">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Selected</span>
                </div>
              )}

              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                <img
                  src={show.poster_url || "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg"}
                  alt={show.movie_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-transparent to-black/30"></div>

                {/* Rating Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-amber-500/40 text-amber-400 font-mono text-xs font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{show.rating || '9.0'}</span>
                </div>

                {/* Certification Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-slate-600 text-slate-300 font-mono text-[10px] font-bold">
                  {show.certification || 'UA'}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3.5 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                    {show.movie_title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
                    {show.genre || "Action • Sci-Fi"}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#22293d] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{show.duration || '2h 8m'}</span>
                  </span>
                  <span className="font-bold text-emerald-400">
                    {show.available_seats} / {show.total_seats} Left
                  </span>
                </div>

                {/* Action CTA Button */}
                <button
                  type="button"
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                    isSelected
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/40'
                      : 'bg-[#1b2133] group-hover:bg-red-600/30 text-slate-300 group-hover:text-white border border-[#2c364e]'
                  }`}
                >
                  <span>{isSelected ? 'Viewing Seats' : 'Select Show'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
