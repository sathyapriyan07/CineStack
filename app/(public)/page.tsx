import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomeSections from "@/components/home/home-sections";
import {
  getTrendingTitles,
  getTopRatedTitles,
  getPopularTitles,
  getUpcomingTitles,
  getRecentlyReleasedTitles
} from "@/lib/db/queries";
import TrendingSection from "@/components/home/trending-section";
import TopRatedSection from "@/components/home/top-rated-section";
import { AppleHeroBanner } from "@/components/ui/apple-hero-banner";
import { ContentRail } from "@/components/ui/content-rail";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: sections },
    trendingTitles,
    topRatedTitles,
    popularTitles,
    upcomingTitles,
    recentTitles
  ] = await Promise.all([
    supabase
      .from("home_sections")
      .select(
        "id, key, title, sort_order, home_section_items(id, title_id, rank, titles!inner(id, title, type, poster_url, slug, is_published))"
      )
      .order("sort_order", { ascending: true }),
    getTrendingTitles(supabase, 20),
    getTopRatedTitles(supabase, 20, 5),
    getPopularTitles(supabase, 20),
    getUpcomingTitles(supabase, 20),
    getRecentlyReleasedTitles(supabase, 20, 90),
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

  // Get featured title for hero (first trending title with backdrop)
  const featuredTitle = trendingTitles.find(t => t.poster_url) || trendingTitles[0];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      {featuredTitle && (
        <AppleHeroBanner
          title={{
            ...featuredTitle,
            backdrop_url: featuredTitle.poster_url, // Using poster as backdrop for now
            overview: "Discover this trending title now available on RareFinds.",
            genres: [] // TODO: Add genres when available
          }}
        />
      )}

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-16">
        {/* Popular Titles */}
        {popularTitles.length > 0 && (
          <ContentRail
            title="Popular Now"
            items={popularTitles}
          />
        )}

        {/* Upcoming Titles */}
        {upcomingTitles.length > 0 && (
          <ContentRail
            title="Coming Soon"
            items={upcomingTitles}
          />
        )}

        {/* Recently Released */}
        {recentTitles.length > 0 && (
          <ContentRail
            title="Recently Released"
            items={recentTitles}
          />
        )}

        {/* Existing Sections */}
        <TrendingSection initialTitles={trendingTitles} />
        <TopRatedSection initialTitles={topRatedTitles} />
        <HomeSections initialSections={flatSections} />
      </div>
    </div>
  );
}

