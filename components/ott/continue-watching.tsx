"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContinueItem {
  id: string;
  title: string;
  poster_url: string;
  progress: number; // 0-100
  remainingTime: string;
  episode?: string;
}

export default function ContinueWatching() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock data
  const continueItems: ContinueItem[] = [
    {
      id: "1",
      title: "The Crown",
      poster_url: "/api/placeholder/200/300",
      progress: 65,
      remainingTime: "1h 36m left",
      episode: "S6 E8",
    },
    {
      id: "2",
      title: "Stranger Things",
      poster_url: "/api/placeholder/200/300",
      progress: 42,
      remainingTime: "45m left",
      episode: "S4 E7",
    },
    {
      id: "3",
      title: "Breaking Bad",
      poster_url: "/api/placeholder/200/300",
      progress: 78,
      remainingTime: "23m left",
      episode: "S5 E12",
    },
    {
      id: "4",
      title: "The Witcher",
      poster_url: "/api/placeholder/200/300",
      progress: 31,
      remainingTime: "2h 12m left",
      episode: "S3 E2",
    },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Continue Watching</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {continueItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex-shrink-0 w-40 cursor-pointer overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-transform hover:scale-105"
          >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={item.poster_url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <div className="h-0 w-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-semibold text-white line-clamp-2">
                {item.title}
              </h3>
              {item.episode && (
                <p className="text-xs text-white/70">{item.episode}</p>
              )}
              <p className="text-xs text-white/60">{item.remainingTime}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}