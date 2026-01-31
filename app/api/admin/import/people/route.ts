import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ImportPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  birthday?: string;
  biography?: string;
}

export async function POST(req: Request) {
  if (!process.env.TMDB_API_KEY) {
    return NextResponse.json({ success: 0, failed: 1, errors: ["TMDB_API_KEY is not set in environment."] }, { status: 400 });
  }
  try {
    const { people }: { people: ImportPerson[] } = await req.json();
    const supabase = await createSupabaseServerClient();

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const person of people) {
      try {
        // Get detailed info from TMDB
        const detailResponse = await fetch(
          `https://api.themoviedb.org/3/person/${person.id}?api_key=${process.env.TMDB_API_KEY}`
        );

        if (!detailResponse.ok) {
          failed++;
          errors.push(`Failed to fetch details for ${person.name}`);
          continue;
        }

        const details = await detailResponse.json();

        // Create slug from name
        const slug = person.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Create the person
        const { error } = await supabase
          .from("people")
          .insert({
            name: person.name,
            slug: slug,
            profile_image_url: person.profile_path
              ? `https://image.tmdb.org/t/p/original${person.profile_path}`
              : null,
            biography: details.biography || null,
            birth_date: details.birthday || null,
            death_date: details.deathday || null,
            birth_place: details.place_of_birth || null,
            tmdb_id: person.id,
          });

        if (error) {
          failed++;
          errors.push(`Failed to create ${person.name}: ${error.message}`);
        } else {
          success++;
        }
      } catch (error) {
        failed++;
        errors.push(`Error importing ${person.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ success, failed, errors });
  } catch (error) {
    console.error("Bulk people import error:", error);
    return NextResponse.json(
      { success: 0, failed: 1, errors: ["Invalid request data"] },
      { status: 400 }
    );
  }
}