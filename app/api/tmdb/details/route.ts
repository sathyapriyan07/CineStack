import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type"); // movie|series

  if (!process.env.TMDB_API_KEY) {
    return new NextResponse("TMDB_API_KEY not set", { status: 400 });
  }
  if (!id || !type) return new NextResponse("Missing id/type", { status: 400 });

  const tmdbType = type === "series" ? "tv" : "movie";
  const res = await fetch(
    `https://api.themoviedb.org/3/${tmdbType}/${encodeURIComponent(
      id
    )}?api_key=${encodeURIComponent(process.env.TMDB_API_KEY)}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

