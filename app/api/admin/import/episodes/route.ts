import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface EpisodeImport {
  seriesId: number;
  seasonNumber: number;
  episodeNumber: number;
  episodeData: any;
}

export async function POST(req: Request) {
  try {
    const { seriesId, seasonNumber, episodeNumber, episodeData }: EpisodeImport = await req.json();
    const supabase = await createSupabaseServerClient();

    // Insert episode into Supabase (adjust table/fields as needed)
    const { error } = await supabase.from("episodes").insert({
      series_id: seriesId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      title: episodeData.name,
      overview: episodeData.overview,
      air_date: episodeData.air_date,
      still_url: episodeData.still_path
        ? `https://image.tmdb.org/t/p/original${episodeData.still_path}`
        : null,
      tmdb_id: episodeData.id,
      runtime: episodeData.runtime,
      vote_average: episodeData.vote_average,
      is_published: false,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request data" }, { status: 400 });
  }
}
