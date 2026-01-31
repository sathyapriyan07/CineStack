import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils";

interface ImportItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
  type: "movie" | "series";
}

export async function POST(req: Request) {
  if (!process.env.TMDB_API_KEY) {
    return NextResponse.json({ success: 0, failed: 1, errors: ["TMDB_API_KEY is not set in environment."] }, { status: 400 });
  }
  try {
    const { items }: { items: ImportItem[] } = await req.json();
    const supabase = await createSupabaseServerClient();

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        // Get detailed info from TMDB
        const tmdbType = item.type === "series" ? "tv" : "movie";
        const detailResponse = await fetch(
          `https://api.themoviedb.org/3/${tmdbType}/${item.id}?api_key=${process.env.TMDB_API_KEY}`
        );

        if (!detailResponse.ok) {
          failed++;
          errors.push(`Failed to fetch details for ${item.title || item.name}`);
          continue;
        }

        const details = await detailResponse.json();

        // Map TMDB genres to our database genres
        const genreMappings: Record<number, string> = {
          28: "Action",
          12: "Adventure",
          16: "Animation",
          35: "Comedy",
          80: "Crime",
          99: "Documentary",
          18: "Drama",
          10751: "Family",
          14: "Fantasy",
          36: "History",
          27: "Horror",
          10402: "Music",
          9648: "Mystery",
          10749: "Romance",
          878: "Science Fiction",
          10770: "TV Movie",
          53: "Thriller",
          10752: "War",
          37: "Western",
          10759: "Action & Adventure",
          10762: "Kids",
          10763: "News",
          10764: "Reality",
          10765: "Sci-Fi & Fantasy",
          10766: "Soap",
          10767: "Talk",
          10768: "War & Politics",
        };

        const genres = details.genres?.map((g: any) => g.name) || [];
        const languages = details.spoken_languages?.map((l: any) => l.english_name) || [];

        // Create the title
        const titleText = item.title || item.name || "";
        const { error } = await supabase
          .from("titles")
          .insert({
            title: titleText,
            slug: toSlug(titleText),
            original_title: details.original_title || details.original_name,
            overview: details.overview || "",
            type: item.type,
            release_date: item.release_date || item.first_air_date,
            runtime: details.runtime || details.episode_run_time?.[0],
            poster_url: item.poster_path
              ? `https://image.tmdb.org/t/p/original${item.poster_path}`
              : null,
            backdrop_url: item.backdrop_path
              ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
              : null,
            age_rating: null, // Will be set manually
            languages: languages,
            country: details.origin_country?.[0] || details.production_countries?.[0]?.iso_3166_1,
            status: details.status,
            is_published: false, // Require manual review
            tmdb_id: item.id,
          });

        if (error) {
          failed++;
          errors.push(`Failed to create ${item.title || item.name}: ${error.message}`);
        } else {
          success++;
        }
      } catch (error) {
        failed++;
        errors.push(`Error importing ${item.title || item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { success: 0, failed: 1, errors: ["Invalid request data"] },
      { status: 400 }
    );
  }
}