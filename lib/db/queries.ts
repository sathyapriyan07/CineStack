import type { SupabaseClient } from "@supabase/supabase-js";

type TitleCard = {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
  rating?: number;
  popularity?: number;
  release_date?: string;
};

type PersonCard = {
  id: string;
  name: string;
  slug: string;
  profile_image_url: string | null;
  known_for_department?: string;
  popularity?: number;
};

type CollectionCard = {
  id: string;
  name: string;
  slug: string;
  poster_url: string | null;
  backdrop_url: string | null;
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

/**
 * Get popular titles based on popularity score
 */
export async function getPopularTitles(
  supabase: SupabaseClient,
  limit: number = 20
): Promise<TitleCard[]> {
  const { data: titles } = await supabase
    .from("titles")
    .select("id, title, type, slug, poster_url, popularity, rating, release_date")
    .eq("is_published", true)
    .not("popularity", "is", null)
    .order("popularity", { ascending: false })
    .limit(limit);

  return (titles || []).map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type as "movie" | "series",
    slug: t.slug,
    poster_url: t.poster_url,
    rating: t.rating,
    popularity: t.popularity,
    release_date: t.release_date,
  }));
}

/**
 * Get upcoming titles (movies/series releasing in the future)
 */
export async function getUpcomingTitles(
  supabase: SupabaseClient,
  limit: number = 20
): Promise<TitleCard[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data: titles } = await supabase
    .from("titles")
    .select("id, title, type, slug, poster_url, popularity, rating, release_date")
    .eq("is_published", true)
    .gte("release_date", today)
    .order("release_date", { ascending: true })
    .limit(limit);

  return (titles || []).map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type as "movie" | "series",
    slug: t.slug,
    poster_url: t.poster_url,
    rating: t.rating,
    popularity: t.popularity,
    release_date: t.release_date,
  }));
}

/**
 * Get recently released titles
 */
export async function getRecentlyReleasedTitles(
  supabase: SupabaseClient,
  limit: number = 20,
  daysBack: number = 90
): Promise<TitleCard[]> {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const dateStr = date.toISOString().split("T")[0];

  const { data: titles } = await supabase
    .from("titles")
    .select("id, title, type, slug, poster_url, popularity, rating, release_date")
    .eq("is_published", true)
    .lte("release_date", new Date().toISOString().split("T")[0])
    .gte("release_date", dateStr)
    .order("release_date", { ascending: false })
    .limit(limit);

  return (titles || []).map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type as "movie" | "series",
    slug: t.slug,
    poster_url: t.poster_url,
    rating: t.rating,
    popularity: t.popularity,
    release_date: t.release_date,
  }));
}

/**
 * Get titles by genre with sorting and filtering
 */
export async function getTitlesByGenre(
  supabase: SupabaseClient,
  genreSlug: string,
  options: {
    sortBy?: "popularity" | "rating" | "release_date" | "title";
    sortOrder?: "asc" | "desc";
    limit?: number;
    type?: "movie" | "series";
  } = {}
): Promise<TitleCard[]> {
  const { sortBy = "popularity", sortOrder = "desc", limit = 20, type } = options;

  let query = supabase
    .from("titles")
    .select(`
      id, title, type, slug, poster_url, popularity, rating, release_date,
      title_genres!inner(genres!inner(slug))
    `)
    .eq("is_published", true)
    .eq("title_genres.genres.slug", genreSlug);

  if (type) {
    query = query.eq("type", type);
  }

  const { data: titles } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .limit(limit);

  return (titles || []).map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type as "movie" | "series",
    slug: t.slug,
    poster_url: t.poster_url,
    rating: t.rating,
    popularity: t.popularity,
    release_date: t.release_date,
  }));
}

/**
 * Global search across titles, people, and collections
 */
export async function globalSearch(
  supabase: SupabaseClient,
  query: string,
  options: {
    limit?: number;
    type?: "all" | "movie" | "series" | "person" | "collection";
  } = {}
): Promise<{
  titles: TitleCard[];
  people: PersonCard[];
  collections: CollectionCard[];
}> {
  const { limit = 10, type = "all" } = options;
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return { titles: [], people: [], collections: [] };
  }

  const results = {
    titles: [] as TitleCard[],
    people: [] as PersonCard[],
    collections: [] as CollectionCard[],
  };

  // Search titles
  if (type === "all" || type === "movie" || type === "series") {
    const titleQuery = supabase
      .from("titles")
      .select("id, title, type, slug, poster_url, popularity, rating, release_date")
      .eq("is_published", true)
      .or(`title.ilike.%${searchTerm}%,original_title.ilike.%${searchTerm}%`)
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (type !== "all") {
      titleQuery.eq("type", type);
    }

    const { data: titles } = await titleQuery;
    results.titles = (titles || []).map((t) => ({
      id: t.id,
      title: t.title,
      type: t.type as "movie" | "series",
      slug: t.slug,
      poster_url: t.poster_url,
      rating: t.rating,
      popularity: t.popularity,
      release_date: t.release_date,
    }));
  }

  // Search people
  if (type === "all" || type === "person") {
    const { data: people } = await supabase
      .from("people")
      .select("id, name, slug, profile_image_url, known_for_department, popularity")
      .ilike("name", `%${searchTerm}%`)
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(limit);

    results.people = (people || []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      profile_image_url: p.profile_image_url,
      known_for_department: p.known_for_department,
      popularity: p.popularity,
    }));
  }

  // Search collections
  if (type === "all" || type === "collection") {
    const { data: collections } = await supabase
      .from("collections")
      .select("id, name, slug, poster_url, backdrop_url")
      .ilike("name", `%${searchTerm}%`)
      .limit(limit);

    results.collections = (collections || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      poster_url: c.poster_url,
      backdrop_url: c.backdrop_url,
    }));
  }

  return results;
}

/**
 * Get detailed title information with cast, crew, and media
 */
export async function getTitleDetails(
  supabase: SupabaseClient,
  slug: string
) {
  const { data: title } = await supabase
    .from("titles")
    .select(`
      *,
      collections(name, slug, poster_url, backdrop_url),
      title_genres(genres(name, slug)),
      cast(
        id,
        character_name,
        billing_order,
        people(id, name, slug, profile_image_url, known_for_department)
      ),
      crew(
        id,
        department,
        job,
        people(id, name, slug, profile_image_url, known_for_department)
      ),
      trailers(youtube_url, label),
      media_uploads(file_path, file_type, is_primary, sort_order)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!title) return null;

  // Get seasons if it's a series
  let seasons = null;
  if (title.type === "series") {
    const { data: seasonsData } = await supabase
      .from("seasons")
      .select(`
        *,
        episodes(
          id,
          episode_number,
          title,
          overview,
          runtime,
          air_date,
          still_url,
          video_url,
          is_published
        )
      `)
      .eq("title_id", title.id)
      .order("season_number", { ascending: true });

    seasons = seasonsData;
  }

  return {
    ...title,
    seasons,
    genres: title.title_genres?.map((tg: any) => tg.genres) || [],
    cast: title.cast?.sort((a: any, b: any) => (a.billing_order || 999) - (b.billing_order || 999)) || [],
    crew: title.crew || [],
    trailers: title.trailers || [],
    media: title.media_uploads || [],
  };
}

/**
 * Get detailed person information with filmography
 */
export async function getPersonDetails(
  supabase: SupabaseClient,
  slug: string
) {
  const { data: person } = await supabase
    .from("people")
    .select(`
      *,
      person_images(file_path, is_primary, aspect_ratio)
    `)
    .eq("slug", slug)
    .single();

  if (!person) return null;

  // Get filmography (cast)
  const { data: castCredits } = await supabase
    .from("cast")
    .select(`
      character_name,
      billing_order,
      titles(id, title, slug, type, poster_url, release_date, rating, popularity)
    `)
    .eq("person_id", person.id)
    .order("titles.release_date", { ascending: false, nullsFirst: false });

  // Get filmography (crew)
  const { data: crewCredits } = await supabase
    .from("crew")
    .select(`
      department,
      job,
      titles(id, title, slug, type, poster_url, release_date, rating, popularity)
    `)
    .eq("person_id", person.id)
    .order("titles.release_date", { ascending: false, nullsFirst: false });

  return {
    ...person,
    images: person.person_images || [],
    cast: castCredits || [],
    crew: crewCredits || [],
  };
}

/**
 * Get collection details with all titles in the collection
 */
export async function getCollectionDetails(
  supabase: SupabaseClient,
  slug: string
) {
  const { data: collection } = await supabase
    .from("collections")
    .select(`
      *,
      titles(
        id,
        title,
        slug,
        type,
        poster_url,
        release_date,
        rating,
        popularity,
        overview
      )
    `)
    .eq("slug", slug)
    .single();

  if (!collection) return null;

  return {
    ...collection,
    titles: collection.titles?.sort((a: any, b: any) =>
      new Date(a.release_date || "1900-01-01").getTime() - new Date(b.release_date || "1900-01-01").getTime()
    ) || [],
  };
}

/**
 * Get titles sorted by various criteria
 */
export async function getTitlesSorted(
  supabase: SupabaseClient,
  options: {
    sortBy: "popularity" | "rating" | "release_date" | "title" | "vote_count";
    sortOrder?: "asc" | "desc";
    type?: "movie" | "series";
    limit?: number;
    offset?: number;
  }
): Promise<TitleCard[]> {
  const { sortBy, sortOrder = "desc", type, limit = 20, offset = 0 } = options;

  let query = supabase
    .from("titles")
    .select("id, title, type, slug, poster_url, popularity, rating, release_date, vote_count")
    .eq("is_published", true);

  if (type) {
    query = query.eq("type", type);
  }

  const { data: titles } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  return (titles || []).map((t) => ({
    id: t.id,
    title: t.title,
    type: t.type as "movie" | "series",
    slug: t.slug,
    poster_url: t.poster_url,
    rating: t.rating,
    popularity: t.popularity,
    release_date: t.release_date,
  }));
}

/**
 * Get all genres
 */
export async function getGenres(supabase: SupabaseClient) {
  const { data: genres } = await supabase
    .from("genres")
    .select("id, name, slug")
    .order("name");

  return genres || [];
}
