"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface RecentSearch {
  id: string;
  title: string;
  poster: string;
  type: "movie" | "series";
}

interface RecentSearchesProps {
  searches: RecentSearch[];
  onClearAll: () => void;
}

export default function RecentSearches({ searches, onClearAll }: RecentSearchesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 120; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const removeSearch = (id: string) => {
    // In real app, this would remove from localStorage or API
    console.log("Removing search:", id);
  };

  if (searches.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Searches</h2>
        <button
          onClick={onClearAll}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        {/* Scroll Buttons */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {searches.map((search) => (
            <div
              key={search.id}
              className="group relative shrink-0 w-24 cursor-pointer"
            >
              {/* Poster */}
              <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-transform group-hover:scale-105">
                <img
                  src={search.poster}
                  alt={search.title}
                  className="h-full w-full object-cover"
                />

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(search.id);
                  }}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Type indicator */}
                <div className="absolute bottom-1 left-1">
                  <span className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white/80 backdrop-blur-sm">
                    {search.type === "movie" ? "Movie" : "Series"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="mt-2 text-xs font-medium text-white/90 line-clamp-2 leading-tight">
                {search.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}