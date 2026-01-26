import type { SupabaseClient } from "@supabase/supabase-js";

type TitleCard = {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
};

/**
 * Get trending titles based on views from last 7 days + admin boost
 * Formula: (sum of views last 7 days) + (admin_boost * 100)
 */
export async function getTrendingTitles(
  supabase: SupabaseClient,
  limit: number = 20
): Promise<TitleCard[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split("T")[0];

  // Get metrics for last 7 days grouped by title_id
  const { data: metrics } = await supabase
    .from("title_metrics_daily")
    .select("title_id, views")
    .gte("metric_date", dateStr);

  // Sum views per title
  const viewsByTitle = (metrics ?? []).reduce((acc: Record<string, number>, m: any) => {
    acc[m.title_id] = (acc[m.title_id] || 0) + (m.views || 0);
    return acc;
  }, {});

  // Get all published titles with admin_boost
  const { data: titles } = await supabase
    .from("titles")
    .select("id, title, type, slug, poster_url, admin_boost")
    .eq("is_published", true);

  if (!titles) return [];

  // Calculate trending score and sort
  const scored = titles
    .map((t) => {
      const views = viewsByTitle[t.id] || 0;
      const boost = (t.admin_boost || 0) * 100; // Multiply boost by 100 for weight
      const score = views + boost;
      return { ...t, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type as "movie" | "series",
    slug: t.slug,
    poster_url: t.poster_url,
  }));
}

/**
 * Get top rated titles using Bayesian average
 * Formula: (v / (v + m)) * R + (m / (v + m)) * C
 * Where:
 * - R = average rating for the title
 * - v = number of votes for the title
 * - m = minimum votes required (e.g., 5)
 * - C = average rating across all titles
 */
export async function getTopRatedTitles(
  supabase: SupabaseClient,
  limit: number = 20,
  minVotes: number = 5
): Promise<TitleCard[]> {
  // Get average rating across all titles
  const { data: globalAvg } = await supabase
    .from("ratings")
    .select("rating")
    .limit(10000); // Sample for performance

  const globalAvgRating =
    globalAvg && globalAvg.length > 0
      ? globalAvg.reduce((sum, r) => sum + r.rating, 0) / globalAvg.length
      : 5.0; // Default to 5.0 if no ratings

  // Get ratings grouped by title with average and count
  const { data: titleRatings } = await supabase
    .from("ratings")
    .select("title_id, rating")
    .limit(10000);

  if (!titleRatings) return [];

  // Group by title_id
  const ratingsByTitle = titleRatings.reduce(
    (acc: Record<string, { sum: number; count: number }>, r: any) => {
      if (!acc[r.title_id]) {
        acc[r.title_id] = { sum: 0, count: 0 };
      }
      acc[r.title_id].sum += r.rating;
      acc[r.title_id].count += 1;
      return acc;
    },
    {}
  );

  // Get titles that have ratings
  const titleIds = Object.keys(ratingsByTitle);
  if (titleIds.length === 0) return [];

  const { data: titles } = await supabase
    .from("titles")
    .select("id, title, type, slug, poster_url")
    .eq("is_published", true)
    .in("id", titleIds);

  if (!titles) return [];

  // Calculate Bayesian score for each title
  const scored = titles
    .map((t) => {
      const stats = ratingsByTitle[t.id];
      if (!stats || stats.count < minVotes) return null;

      const avgRating = stats.sum / stats.count;
      const v = stats.count;
      const m = minVotes;
      const R = avgRating;
      const C = globalAvgRating;

      // Bayesian average
      const score = (v / (v + m)) * R + (m / (v + m)) * C;

      return { ...t, score, voteCount: v, avgRating: R };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type as "movie" | "series",
    slug: t.slug,
    poster_url: t.poster_url,
  }));
}
