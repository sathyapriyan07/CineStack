"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createSupabaseBrowserClient as createSupabaseClient } from "@/lib/supabase/client";
import { GlassPosterCard } from "@/components/ui/glass-poster-card";

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
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-white tracking-tight">Continue Watching</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 px-1 snap-x snap-mandatory scroll-smooth scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {continueItems.map((item) => (
          <div key={item.id} className="relative shrink-0 snap-start">
            <GlassPosterCard
              id={item.id}
              title={item.title}
              type={item.episode ? "series" : "movie"}
              slug={item.slug}
              poster_url={item.poster_url}
              size="sm"
              className="!w-[120px]"
            />
            {/* Progress Bar overlay */}
            <div className="absolute left-0 right-0 bottom-1 mx-2 h-1 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            {/* Episode/Time overlay */}
            <div className="absolute left-0 right-0 bottom-0 px-2 pb-0.5 flex flex-col items-center">
              {item.episode && (
                <span className="text-[10px] text-white/80 leading-tight">{item.episode}</span>
              )}
              <span className="text-[10px] text-white/60 leading-tight">{item.remainingTime}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}