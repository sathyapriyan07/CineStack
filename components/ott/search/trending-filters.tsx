"use client";

import { useRef } from "react";

interface TrendingFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function TrendingFilters({ activeFilter, onFilterChange }: TrendingFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filters = [
    "India",
    "Movies",
    "Shows",
    "Action",
    "Comedy",
    "Crime",
    "Drama",
    "Thriller",
    "Romance",
    "Horror",
    "Sci-Fi",
    "Documentary",
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 100;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Trending in</h2>
      </div>

      {/* Filter Chips */}
      <div className="relative">
        {/* Scroll Buttons */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 transition-colors backdrop-blur-sm"
          >
            <span className="text-sm">‹</span>
          </button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 transition-colors backdrop-blur-sm"
          >
            <span className="text-sm">›</span>
          </button>
        </div>

        {/* Chips Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-pink-600 text-white shadow-lg shadow-blue-500/25 border border-white/20"
                    : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}