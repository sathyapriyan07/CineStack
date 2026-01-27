"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTrendingTitles } from "@/lib/db/queries";

type TitleCard = {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
};

export default function TrendingSection({ initialTitles }: { initialTitles: TitleCard[] }) {
  const [titles, setTitles] = useState<TitleCard[]>(initialTitles);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const refresh = async () => {
      const updated = await getTrendingTitles(supabase, 20);
      setTitles(updated);
    };

    // Subscribe to changes in metrics and titles
    const channel = supabase
      .channel("trending-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "title_metrics_daily" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "titles" }, refresh)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!titles.length) return null;

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-white">Trending Now</h2>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
        {titles.map((t) => (
          <a key={t.id} href={`/titles/${t.slug}`} className="group w-48 shrink-0">
            <div className="aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm shadow-lg transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
              {t.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.poster_url}
                  alt={t.title}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-white/40">
                  No poster
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 rounded-full p-3 transition-all hover:shadow-lg hover:shadow-blue-500/25">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">{t.title}</div>
              <div className="text-xs text-white/60 mt-1">{t.type.toUpperCase()}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
