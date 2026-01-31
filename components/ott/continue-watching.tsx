"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createSupabaseBrowserClient as createSupabaseClient } from "@/lib/supabase/client";

interface ContinueItem {
  id: string;
  title: string;
  poster_url: string;
  progress: number; // 0-100
  remainingTime: string;
  episode?: string;
  slug: string;
}

export default function ContinueWatching() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [continueItems, setContinueItems] = useState<ContinueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContinueWatching = async () => {
      try {
        const supabase = createSupabaseClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // If no user, show some popular titles as suggestions
          const { data: popularTitles, error } = await supabase
            .from("titles")
            .select("id, title, poster_url, slug, type")
            .eq("is_published", true)
            .order("vote_average", { ascending: false })
            .limit(4);

          if (!error && popularTitles) {
            const formattedItems = popularTitles.map(title => ({
              id: title.id,
              title: title.title,
              poster_url: title.poster_url,
              progress: Math.floor(Math.random() * 80) + 20, // Random progress for demo
              remainingTime: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m left`,
              episode: title.type === 'series' ? `S${Math.floor(Math.random() * 5) + 1} E${Math.floor(Math.random() * 10) + 1}` : undefined,
              slug: title.slug,
            }));
            setContinueItems(formattedItems);
          }
          return;
        }

        // Fetch user's watchlist
        const { data: watchlist, error } = await supabase
          .from("watchlist")
          .select(`
            id,
            titles: title_id (
              id,
              title,
              poster_url,
              slug,
              type
            )
          `)
          .eq("user_id", user.id)
          .limit(6);

        if (error) {
          console.error("Error fetching watchlist:", error);
          return;
        }

        if (watchlist && watchlist.length > 0) {
          const formattedItems = watchlist.map(item => {
            const title = item.titles as any;
            return {
              id: item.id,
              title: title.title,
              poster_url: title.poster_url,
              progress: Math.floor(Math.random() * 80) + 20, // Random progress for demo
              remainingTime: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m left`,
              episode: title.type === 'series' ? `S${Math.floor(Math.random() * 5) + 1} E${Math.floor(Math.random() * 10) + 1}` : undefined,
              slug: title.slug,
            };
          });
          setContinueItems(formattedItems);
        } else {
          // If no watchlist, show popular titles
          const { data: popularTitles } = await supabase
            .from("titles")
            .select("id, title, poster_url, slug, type")
            .eq("is_published", true)
            .order("vote_average", { ascending: false })
            .limit(4);

          if (popularTitles) {
            const formattedItems = popularTitles.map(title => ({
              id: title.id,
              title: title.title,
              poster_url: title.poster_url,
              progress: Math.floor(Math.random() * 80) + 20,
              remainingTime: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m left`,
              episode: title.type === 'series' ? `S${Math.floor(Math.random() * 5) + 1} E${Math.floor(Math.random() * 10) + 1}` : undefined,
              slug: title.slug,
            }));
            setContinueItems(formattedItems);
          }
        }
      } catch (error) {
        console.error("Error fetching continue watching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContinueWatching();
  }, []);

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
            className="group relative shrink-0 w-40 cursor-pointer overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-transform hover:scale-105"
          >
            {/* Poster Image */}
            <div className="relative aspect-2/3 overflow-hidden">
              <img
                src={item.poster_url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-pink-500 transition-all duration-300"
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