"use client";

import { useEffect, useState } from "react";
import SectionRow from "../ui/section-row";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTrendingTitles, getTopRatedTitles } from "@/lib/db/queries";

export default function HomeSections() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const trendingData = await getTrendingTitles(supabase, 12);
      const topRatedData = await getTopRatedTitles(supabase, 12);
      setTrending(trendingData);
      setTopRated(topRatedData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-12 pb-24">
        <div className="h-8 w-1/3 bg-gray-800 rounded-xl animate-pulse" />
        <div className="flex gap-3 overflow-x-auto pb-1 px-2 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[120px] aspect-[2/3] bg-gray-700 rounded-xl animate-pulse soft-shadow" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {trending.length > 0 && (
        <SectionRow title="Trending Now" items={trending.map(t => ({ poster: t.poster_url, title: t.title }))} />
      )}
      {topRated.length > 0 && (
        <SectionRow title="Top Rated" items={topRated.map(t => ({ poster: t.poster_url, title: t.title }))} />
      )}
    </div>
  );
}

// ...existing code...

