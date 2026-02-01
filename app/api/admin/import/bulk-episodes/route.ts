import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface BulkEpisodeImport {
  seriesId: number;
  seasonNumber: number;
  episodes: any[];
}

export async function POST(req: Request) {
  try {
    const { seriesId, seasonNumber, episodes }: BulkEpisodeImport = await req.json();
    const supabase = await createSupabaseServerClient();
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    for (const episodeData of episodes) {
      const { episodeNumber, data } = episodeData;
      const { error } = await supabase.from("episodes").insert({
        series_id: seriesId,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        title: data.name,
        overview: data.overview,
        air_date: data.air_date,
        still_url: data.still_path ? `https://image.tmdb.org/t/p/original${data.still_path}` : null,
        tmdb_id: data.id,
        runtime: data.runtime,
        vote_average: data.vote_average,
        is_published: false,
      });
      if (error) {
        failed++;
        errors.push(`Failed to import episode ${episodeNumber}: ${error.message}`);
      } else {
        success++;
      }
    }
    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    return NextResponse.json({ success: 0, failed: 1, errors: ["Invalid request data"] }, { status: 400 });
  }
}
