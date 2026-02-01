import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const seriesId = url.searchParams.get("seriesId");
  const seasonNumber = url.searchParams.get("seasonNumber");
  const episodeNumber = url.searchParams.get("episodeNumber");

  if (!process.env.TMDB_API_KEY) {
    return new NextResponse("TMDB_API_KEY not set", { status: 400 });
  }
  if (!seriesId || !seasonNumber || !episodeNumber) {
    return new NextResponse("Missing seriesId/seasonNumber/episodeNumber", { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${encodeURIComponent(seriesId)}/season/${encodeURIComponent(seasonNumber)}/episode/${encodeURIComponent(episodeNumber)}?api_key=${encodeURIComponent(process.env.TMDB_API_KEY)}`,
      {
        next: { revalidate: 0 },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching TMDB episode details:", error);
    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse("TMDB API request timed out. Please check your internet connection.", { status: 408 });
    }
    return new NextResponse("Failed to fetch from TMDB API. Please try again later.", { status: 500 });
  }
}
