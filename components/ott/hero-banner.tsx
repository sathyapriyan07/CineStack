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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdrop_url}
          alt={currentMovie.title}
          className="h-full w-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end pb-32">
        <div className="w-full px-6">
          {/* Movie Title */}
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {currentMovie.title}
          </h1>

          {/* Metadata Row */}
          <div className="mb-6 flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span>{currentMovie.vote_average}</span>
            </div>
            <span>•</span>
            <span>{currentMovie.release_date}</span>
            <span>•</span>
            <div className="flex gap-2">
              {currentMovie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.name}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            {user ? (
              <>
                <Button
                  onClick={handleWatchNow}
                  className="flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Watch Now
                </Button>

                <Button
                  onClick={handleAddToList}
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
                >
                  <Plus className="h-5 w-5" />
                  Add to List
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 rounded-full bg-linear-to-r from-green-600 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <LogIn className="h-5 w-5" />
                Login to Continue
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
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