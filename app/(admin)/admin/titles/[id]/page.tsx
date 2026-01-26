import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import TitleEditor from "@/components/admin/title-editor";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminTitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const supabase = await createSupabaseServerClient();

  const [{ data: title }, { data: allGenres }, { data: selectedGenres }, { data: allPeople }] =
    await Promise.all([
      isNew
        ? Promise.resolve({ data: null as any })
        : supabase
            .from("titles")
            .select(
              "id, type, title, original_title, slug, overview, release_date, runtime, status, age_rating, languages, country, poster_url, backdrop_url, is_published, tmdb_id, admin_boost"
            )
            .eq("id", id)
            .single(),
      supabase.from("genres").select("id, name, slug").order("name"),
      isNew
        ? Promise.resolve({ data: [] as any[] })
        : supabase
            .from("title_genres")
            .select("genre_id")
            .eq("title_id", id),
      supabase.from("people").select("id, name, profile_image_url").order("name"),
    ]);

  if (!isNew && !title) return notFound();

  const genreIds = new Set((selectedGenres ?? []).map((g: any) => g.genre_id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {isNew ? "Create New Title" : `Edit: ${title.title}`}
          </h1>
          <p className="mt-1 text-xs text-white/60">
            {isNew 
              ? "Fill in the form below to create a new movie or series. At minimum, provide a title and type."
              : "Update the title details below."}
          </p>
        </div>
        {!isNew && (
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/titles">← Back to List</Link>
          </Button>
        )}
      </div>
      <TitleEditor
        initialTitle={title}
        allGenres={allGenres ?? []}
        initialGenreIds={[...genreIds]}
        allPeople={allPeople ?? []}
      />
    </div>
  );
}

