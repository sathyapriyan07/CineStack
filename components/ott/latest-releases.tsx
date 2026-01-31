"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createSupabaseBrowserClient as createSupabaseClient } from "@/lib/supabase/client";
import { GlassPosterCard } from "@/components/ui/glass-poster-card";

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
    <section className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm font-semibold text-white tracking-tight">Latest Releases</h2>
        <div className="flex gap-0.5">
          <button
            onClick={() => scroll("left")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-0.5 px-0.5 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {latestMovies.map((movie) => (
          <div className="snap-start">
            <GlassPosterCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              type="movie"
              slug={movie.slug}
              poster_url={movie.poster_url}
              rating={movie.rating}
              release_date={movie.release_date}
              size="sm"
              className="!w-28"
            />
          </div>
        ))}
      </div>
    </section>
  );
}