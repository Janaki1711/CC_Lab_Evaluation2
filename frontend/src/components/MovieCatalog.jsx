import React from 'react';
import { Star, Film, Check, ChevronRight } from 'lucide-react';

export default function MovieCatalog({
  shows,
  selectedShowId,
  onSelectShow
}) {
  if (!shows || shows.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Film className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Select Movie
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {shows.length} Blockbusters Available
        </span>
      </div>

      {/* Movie Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shows.map((show) => {
          const isSelected = show.id === selectedShowId;

          return (
            <div
              key={show.id}
              onClick={() => onSelectShow(show)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                isSelected
                  ? 'bg-[#181d2c] border-red-500 shadow-xl shadow-red-950/50 ring-2 ring-red-500/60 scale-[1.01]'
                  : 'bg-[#11141e] hover:bg-[#161a27] border-[#222839] hover:border-slate-500'
              }`}
            >
              {/* Selected Pill */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[9px] font-black uppercase flex items-center space-x-1 shadow-md">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Selected</span>
                </div>
              )}

              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                <img
                  src={show.poster_url || "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg"}
                  alt={show.movie_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11141e] via-transparent to-black/30"></div>

                {/* Rating Badge */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/85 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{show.rating || '9.0'}</span>
                </div>
              </div>

              {/* Meta Content */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition">
                    {show.movie_title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                    {show.genre || "Action • Sci-Fi"}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1e2436] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{show.duration || '2h 8m'}</span>
                  <span className="font-bold text-emerald-400">
                    {show.available_seats} Left
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
