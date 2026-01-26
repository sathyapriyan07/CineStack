import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomeSections from "@/components/home/home-sections";
import { getTrendingTitles, getTopRatedTitles } from "@/lib/db/queries";
import TrendingSection from "@/components/home/trending-section";
import TopRatedSection from "@/components/home/top-rated-section";

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
    <div className="mx-auto max-w-6xl px-4 py-6">
      <section className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">Curated Movies & Series</h1>
        <p className="max-w-xl text-sm text-white/70">
          Browse admin-curated lists of movies and series. Updates publish
          instantly and propagate in realtime.
        </p>
      </section>

      <TrendingSection initialTitles={trendingTitles} />
      <TopRatedSection initialTitles={topRatedTitles} />
      <HomeSections initialSections={flatSections} />
    </div>
  );
}

