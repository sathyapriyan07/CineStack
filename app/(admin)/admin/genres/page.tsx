import { createSupabaseServerClient } from "@/lib/supabase/server";
import GenresAdmin from "@/components/admin/genres-admin";

export const dynamic = "force-dynamic";

export default async function AdminGenresPage() {
  const supabase = await createSupabaseServerClient();
  const { data: genres } = await supabase
    .from("genres")
    .select("id, name, slug")
    .order("name");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Genres</h1>
      <GenresAdmin initialGenres={genres ?? []} />
    </div>
  );
}

