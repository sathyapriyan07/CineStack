import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGenres, getTitlesSorted } from "@/lib/db/queries";
import { FilterBar } from "@/components/ui/filter-bar";
import { TitleCard } from "@/components/ui/title-card";
import { Suspense } from "react";
import TitlesClient from "./titles-client";

type SearchParams = {
  sortBy?: string;
  sortOrder?: string;
  type?: string;
  genre?: string;
  page?: string;
};

const PAGE_SIZE = 24;

async function TitlesContent({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createSupabaseServerClient();

  const sortBy = (searchParams.sortBy as any) || "popularity";
  const sortOrder = (searchParams.sortOrder as "asc" | "desc") || "desc";
  const type = (searchParams.type as "movie" | "series" | "all") || "all";
  const genre = searchParams.genre || "";
  const page = Number(searchParams.page ?? "1");

  const offset = (page - 1) * PAGE_SIZE;

  // Get genres for filter
  const genres = await getGenres(supabase);

  // Get titles with sorting and filtering
  let titles: any[] = [];
  let totalCount = 0;

  if (genre) {
    // If genre filter is applied, we need to join with title_genres
    const { data, count } = await supabase
      .from("titles")
      .select(`
        id, title, type, slug, poster_url, popularity, rating, release_date, vote_count,
        title_genres!inner(genre_id)
      `, { count: "exact" })
      .eq("is_published", true)
      .eq("title_genres.genre_id", genres.find(g => g.slug === genre)?.id)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + PAGE_SIZE - 1);

    titles = data || [];
    totalCount = count || 0;
  } else {
    // Use the getTitlesSorted function for non-genre filtered queries
    const typeFilter = type === "all" ? undefined : type;
    titles = await getTitlesSorted(supabase, {
      sortBy,
      sortOrder,
      type: typeFilter,
      limit: PAGE_SIZE,
      offset
    });

    // Get total count for pagination
    let countQuery = supabase
      .from("titles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    if (typeFilter) {
      countQuery = countQuery.eq("type", typeFilter);
    }

    const { count } = await countQuery;
    totalCount = count || 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Browse All Titles</h1>
          <p className="text-gray-400 text-lg">Discover movies and series from our collection</p>
        </div>

        <TitlesClient
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
          initialType={type}
          initialGenre={genre}
          availableGenres={genres}
          titles={titles}
          totalPages={totalPages}
          currentPage={page}
        />
      </div>
    </div>
  );
}

export default async function TitlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <TitlesContent searchParams={sp} />
    </Suspense>
  );
}

