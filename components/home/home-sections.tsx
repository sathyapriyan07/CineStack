"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TitleCard = {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
};

type Section = {
  id: string;
  key: string;
  title: string;
  sort_order: number;
  items: TitleCard[];
};

export default function HomeSections({
  initialSections,
}: {
  initialSections: Section[];
}) {
  const [sections, setSections] = useState<Section[]>(initialSections);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const refresh = async () => {
      const { data } = await supabase
        .from("home_sections")
        .select(
          "id, key, title, sort_order, home_section_items(id, title_id, rank, titles!inner(id, title, type, poster_url, slug, is_published))"
        )
        .order("sort_order", { ascending: true });

      const next =
        data?.map((s: any) => ({
          id: s.id,
          key: s.key,
          title: s.title,
          sort_order: s.sort_order,
          items:
            (s.home_section_items ?? [])
              .filter((i: any) => i.titles?.is_published)
              .sort((a: any, b: any) => a.rank - b.rank)
              .map((i: any) => i.titles) ?? [],
        })) ?? [];
      setSections(next);
    };

    const channel = supabase
      .channel("public-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "home_section_items" },
        refresh
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "titles" }, refresh)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!sections.length) {
    return (
      <p className="mt-6 text-sm text-white/60">
        No curated sections yet. Admins can create them in the dashboard.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <div key={section.id}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
            {section.items.map((t) => (
              <Link key={t.id} href={`/titles/${t.slug}`} className="group w-48 shrink-0">
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
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-12 flex justify-center">
        <Link href="/titles" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25">
          Browse all titles
        </Link>
      </div>
    </div>
  );
}

