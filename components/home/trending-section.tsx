"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTrendingTitles } from "@/lib/db/queries";
import { GlassPosterCard } from "@/components/ui/glass-poster-card";

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
      <h2 className="mb-6 text-3xl font-light text-white tracking-tight drop-shadow-md">Trending Now</h2>
      <div className="flex gap-7 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {titles.map((t) => (
          <GlassPosterCard
            key={t.id}
            id={t.id}
            title={t.title}
            type={t.type}
            slug={t.slug}
            poster_url={t.poster_url}
            size="md"
            className="snap-start"
          />
        ))}
      </div>
    </div>
  );
}
