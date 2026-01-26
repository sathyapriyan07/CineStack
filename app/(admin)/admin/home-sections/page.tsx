import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomeSectionsAdmin from "@/components/admin/home-sections-admin";

export const dynamic = "force-dynamic";

export default async function AdminHomeSectionsPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: sections }, { data: titles }] = await Promise.all([
    supabase
      .from("home_sections")
      .select(
        "id, key, title, sort_order, home_section_items(id, rank, title_id, titles!inner(id, title, type, poster_url, slug, is_published))"
      )
      .order("sort_order", { ascending: true }),
    supabase
      .from("titles")
      .select("id, title, type, is_published")
      .order("updated_at", { ascending: false })
      .limit(500),
  ]);

  const mapped =
    sections?.map((s: any) => ({
      id: s.id,
      key: s.key,
      title: s.title,
      sort_order: s.sort_order,
      items:
        (s.home_section_items ?? [])
          .sort((a: any, b: any) => a.rank - b.rank)
          .map((i: any) => ({
            id: i.id,
            rank: i.rank,
            title_id: i.title_id,
            title: i.titles,
          })) ?? [],
    })) ?? [];

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Home sections</h1>
      <HomeSectionsAdmin initialSections={mapped} allTitles={titles ?? []} />
    </div>
  );
}

