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
  const res = await fetch(
    `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${encodeURIComponent(
      process.env.TMDB_API_KEY
    )}&query=${encodeURIComponent(q)}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

