import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { seriesId, seasonNumber, episodeNumbers } = await req.json(); // episodeNumbers: number[]
  if (!process.env.TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 400 });
  }
  if (!seriesId || !seasonNumber || !Array.isArray(episodeNumbers)) {
    return NextResponse.json({ error: "Missing seriesId/seasonNumber/episodeNumbers" }, { status: 400 });
  }
  try {
    const results = [];
    for (const episodeNumber of episodeNumbers) {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${encodeURIComponent(seriesId)}/season/${encodeURIComponent(seasonNumber)}/episode/${encodeURIComponent(episodeNumber)}?api_key=${encodeURIComponent(process.env.TMDB_API_KEY)}`
      );
      const data = await res.json();
      results.push({ episodeNumber, data });
    }
    return NextResponse.json({ episodes: results });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 });
  }
}
