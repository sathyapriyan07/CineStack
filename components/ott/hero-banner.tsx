"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Plus, LogIn } from "lucide-react";
import { createSupabaseBrowserClient as createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_url: string;
  backdrop_url: string;
  release_date: string;
  genres: { name: string }[];
  vote_average: number;
  slug: string;
}

export default function HeroBanner() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const supabase = createSupabaseClient();

        // Fetch featured movies (you can modify this query based on your home sections or featured logic)
        const { data: movies, error } = await supabase
          .from("titles")
          .select(`
            id,
            title,
            overview,
            poster_url,
            backdrop_url,
            release_date,
            vote_average,
            slug,
            genres:genre_titles(name)
          `)
          .eq("is_published", true)
          .eq("type", "movie")
          .order("vote_average", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching featured movies:", error);
          return;
        }

        if (movies && movies.length > 0) {
          setFeaturedMovies(movies);
          setCurrentMovie(movies[0]);
        }
      } catch (error) {
        console.error("Error fetching featured movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMovies();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    const supabase = createSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleWatchNow = () => {
    // Handle watch now action
    console.log("Watch now:", currentMovie?.title);
  };

  const handleAddToList = () => {
    // Handle add to list action
    console.log("Add to list:", currentMovie?.title);
  };

  if (!currentMovie) return null;

  return (
    <div className="relative w-full h-[45vh] min-h-[220px] max-h-[45vh] flex flex-col justify-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdrop_url}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center max-h-[45vh]"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end pb-2 md:pb-4">
        <div className="w-full px-2 sm:px-3">
          {/* Movie Title */}
          <h1 className="mb-1 text-xl font-semibold leading-tight text-white truncate md:text-2xl lg:text-3xl">
            {currentMovie.title}
          </h1>
          {/* Metadata Row */}
          <div className="mb-1 flex items-center gap-1 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span>{currentMovie.vote_average}</span>
            </div>
            <span>•</span>
            <span>{currentMovie.release_date}</span>
            <span>•</span>
            <div className="flex gap-0.5">
              {currentMovie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.name}
                  className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          {/* CTA Buttons */}
          <div className="flex gap-1.5">
            {user ? (
              <>
                <Button
                  onClick={handleWatchNow}
                  className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:scale-105 hover:shadow-lg transition"
                >
                  <Play className="h-4 w-4" />
                  Watch
                </Button>
                <Button
                  onClick={handleAddToList}
                  variant="outline"
                  className="flex items-center gap-1 rounded-full border-white/30 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:scale-105 hover:bg-white/20 transition"
                >
                  <Plus className="h-4 w-4" />
                  List
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:scale-105 hover:shadow-lg transition"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setCurrentMovie(featuredMovies[index]);
            }}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}