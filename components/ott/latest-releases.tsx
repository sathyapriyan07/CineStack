"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createSupabaseBrowserClient as createSupabaseClient } from "@/lib/supabase/client";

interface Movie {
  id: string;
  title: string;
  poster_url: string;
  release_date: string;
  rating?: number;
  slug: string;
}

export default function LatestReleases() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReleases = async () => {
      try {
        const supabase = createSupabaseClient();

        // Fetch latest released titles
        const { data: movies, error } = await supabase
          .from("titles")
          .select("id, title, poster_url, release_date, vote_average, slug")
          .eq("is_published", true)
          .order("release_date", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching latest releases:", error);
          return;
        }

        if (movies) {
          const formattedMovies = movies.map(movie => ({
            id: movie.id,
            title: movie.title,
            poster_url: movie.poster_url,
            release_date: movie.release_date?.split('-')[0] || 'TBA', // Extract year
            rating: movie.vote_average,
            slug: movie.slug,
          }));
          setLatestMovies(formattedMovies);
        }
      } catch (error) {
        console.error("Error fetching latest releases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReleases();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 140; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Latest Releases</h2>
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
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {latestMovies.map((movie) => (
          <div
            key={movie.id}
            className="group relative flex-shrink-0 w-32 cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Rating badge */}
              {movie.rating && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  <span className="text-yellow-400">⭐</span>
                  <span>{movie.rating}</span>
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <div className="h-0 w-0 border-l-3 border-l-white border-t-1.5 border-t-transparent border-b-1.5 border-b-transparent ml-0.5" />
                </div>
              </div>
            </div>

            {/* Title overlay on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <h3 className="text-xs font-semibold text-white line-clamp-2">
                {movie.title}
              </h3>
              <p className="text-xs text-white/70">{movie.release_date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}