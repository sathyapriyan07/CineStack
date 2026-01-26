"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTopRatedTitles } from "@/lib/db/queries";

type TitleCard = {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
};

export default function TopRatedSection({ initialTitles }: { initialTitles: TitleCard[] }) {
  const [titles, setTitles] = useState<TitleCard[]>(initialTitles);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const refresh = async () => {
      const updated = await getTopRatedTitles(supabase, 20, 5);
      setTitles(updated);
    };

    // Subscribe to changes in ratings
    const channel = supabase
      .channel("top-rated-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "ratings" }, refresh)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!titles.length) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">Top Rated</h2>
      <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
        {titles.map((t) => (
          <a key={t.id} href={`/titles/${t.slug}`} className="group w-40 shrink-0">
            <div className="aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-slate-900">
              {t.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.poster_url}
                  alt={t.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-white/40">
                  No poster
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-white/60">{t.type.toUpperCase()}</div>
            <div className="text-sm font-medium text-white/90 line-clamp-2">{t.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
