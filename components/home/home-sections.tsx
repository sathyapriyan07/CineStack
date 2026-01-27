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
    <div className="space-y-16">
      {sections.map((section) => (
        <div key={section.id} className="px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{section.title}</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {section.items.map((t) => (
              <div key={t.id} className="group cursor-pointer transition-all duration-300 hover:scale-105 flex-shrink-0 w-48">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-gray-800 shadow-lg group-hover:shadow-2xl group-hover:shadow-black/50 transition-all duration-300">
                  {t.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.poster_url}
                      alt={t.title}
                      className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-700">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🎬</div>
                        <div className="text-sm">No poster</div>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <Link
                      href={`/titles/${t.slug}`}
                      className="bg-white/90 hover:bg-white text-black rounded-full p-4 transition-all duration-200 hover:scale-110 shadow-lg"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Title info */}
                <div className="mt-4">
                  <h3 className="text-white font-semibold text-base line-clamp-2 group-hover:text-gray-300 transition-colors duration-200">
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-gray-700 px-2 py-1 rounded-full text-xs font-medium text-gray-300">
                      {t.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-center px-6">
        <Link
          href="/titles"
          className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Browse all titles
        </Link>
      </div>
    </div>
  );
}

