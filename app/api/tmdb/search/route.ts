import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const type = url.searchParams.get("type"); // movie|series

  if (!process.env.TMDB_API_KEY) {
    return new NextResponse("TMDB_API_KEY not set", { status: 400 });
  }
  if (!q || !type) return new NextResponse("Missing q/type", { status: 400 });

  const tmdbType = type === "series" ? "tv" : "movie";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const res = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${encodeURIComponent(
        process.env.TMDB_API_KEY
      )}&query=${encodeURIComponent(q)}`,
      { 
        next: { revalidate: 0 },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      return new NextResponse("TMDB API request timed out. Please check your internet connection.", { status: 408 });
    }
    return new NextResponse("Failed to fetch from TMDB API. Please try again later.", { status: 500 });
  }
}

