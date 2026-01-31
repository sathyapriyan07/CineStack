"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassPosterCard } from "@/components/ui/glass-poster-card";
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
          <div className="flex gap-7 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
            {section.items.map((t) => (
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

