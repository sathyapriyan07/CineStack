import { createSupabaseServerClient } from "@/lib/supabase/server";
import PeopleAdmin from "@/components/admin/people-admin";

export default async function AdminPeoplePage() {
  const supabase = await createSupabaseServerClient();
  const { data: people } = await supabase
    .from("people")
    .select("id, name, profile_image_url, bio, slug")
    .order("name");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">People (Cast & Crew)</h1>
      <p className="mb-4 text-xs text-white/60">
        Manage actors, directors, writers, and other crew members. Assign them to titles in the title editor.
      </p>
      <PeopleAdmin initialPeople={people ?? []} />
    </div>
  );
}
