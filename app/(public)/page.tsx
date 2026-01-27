import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomeSections from "@/components/home/home-sections";
import { getTrendingTitles, getTopRatedTitles } from "@/lib/db/queries";
import TrendingSection from "@/components/home/trending-section";
import TopRatedSection from "@/components/home/top-rated-section";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: sections }, trendingTitles, topRatedTitles] = await Promise.all([
    supabase
      .from("home_sections")
      .select(
        "id, key, title, sort_order, home_section_items(id, title_id, rank, titles!inner(id, title, type, poster_url, slug, is_published))"
      )
      .order("sort_order", { ascending: true }),
    getTrendingTitles(supabase, 20),
    getTopRatedTitles(supabase, 20, 5),
  ]);

  const flatSections =
    sections?.map((s: any) => ({
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

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      {trendingTitles.length > 0 && (
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            {trendingTitles[0].poster_url ? (
              <img
                src={trendingTitles[0].poster_url}
                alt={trendingTitles[0].title}
                className="h-full w-full object-cover opacity-60"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-red-900 to-black"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex h-full items-center px-6 max-w-7xl mx-auto">
            <div className="max-w-lg text-white">
              <h1 className="text-5xl font-bold mb-4">{trendingTitles[0].title}</h1>
              <p className="text-lg mb-6 text-white/80">
                Discover this trending {trendingTitles[0].type} now available on RareFinds.
              </p>
              <div className="flex gap-4">
                <Link
                  href={`/titles/${trendingTitles[0].slug}`}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  View
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-6 py-12">
        <TrendingSection initialTitles={trendingTitles} />
        <TopRatedSection initialTitles={topRatedTitles} />
        <HomeSections initialSections={flatSections} />
      </div>
    </div>
  );
}

