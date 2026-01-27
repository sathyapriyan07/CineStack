import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Search titles (movies and series)
    const { data: titles } = await supabase
      .from("titles")
      .select("id, title, type, poster_url, slug, release_date")
      .eq("is_published", true)
      .ilike("title", `%${q}%`)
      .limit(5);

    // Search people
    const { data: people } = await supabase
      .from("people")
      .select("id, name, profile_image_url, slug, birth_date")
      .ilike("name", `%${q}%`)
      .limit(5);

    // Combine and format results
    const results = [
      ...(titles?.map(title => ({
        id: title.id,
        title: title.title,
        type: title.type as "movie" | "series",
        poster_url: title.poster_url,
        slug: title.slug,
        release_date: title.release_date,
      })) || []),
      ...(people?.map(person => ({
        id: person.id,
        title: person.name,
        type: "person" as const,
        profile_image_url: person.profile_image_url,
        slug: person.slug,
        birth_date: person.birth_date,
      })) || []),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}