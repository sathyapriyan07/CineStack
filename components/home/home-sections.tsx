"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.id}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{section.title}</h2>
          </div>
          <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
            {section.items.map((t) => (
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
                <div className="text-sm font-medium text-white/90 line-clamp-2">
                  {t.title}
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-8 flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <a href="/titles">Browse all titles</a>
        </Button>
      </div>
    </div>
  );
}

