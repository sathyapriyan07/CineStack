import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Person = { id: string; name: string; profile_image_url: string | null; slug: string | null };
type Credit = {
  id: string;
  role: string;
  character_name: string | null;
  billing_order: number | null;
  department: string | null;
  people: Person;
};

export default async function TitleCreditsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: title } = await supabase
    .from("titles")
    .select("id, title")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!title) return notFound();

  const { data: credits } = await supabase
    .from("title_credits")
    .select(
      "id, role, character_name, billing_order, department, people(id, name, profile_image_url, slug)"
    )
    .eq("title_id", title.id)
    .order("billing_order", { ascending: true })
    .order("role", { ascending: true });

  // Separate cast and crew
  const cast = (credits ?? []).filter((c: any) => c.role === "actor");
  const crew = (credits ?? []).filter((c: any) => c.role !== "actor");

  // Sort cast by billing_order
  const sortedCast = [...cast].sort((a: any, b: any) => {
    const aOrder = a.billing_order ?? 9999;
    const bOrder = b.billing_order ?? 9999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.people.name.localeCompare(b.people.name);
  });

  // Group crew by role
  const crewByRole: Record<string, any[]> = crew.reduce((acc: any, c: any) => {
    const role = c.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(c);
    return acc;
  }, {});

  const roleLabels: Record<string, string> = {
    director: "Directors",
    writer: "Writers",
    producer: "Producers",
    composer: "Composers",
    music_director: "Music Directors",
    cinematographer: "Cinematographers",
    editor: "Editors",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <Link href={`/titles/${slug}`} className="text-sm text-[--accent] hover:underline">
          ← Back to {title.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Full Cast & Crew</h1>
      </div>

      {sortedCast.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Cast</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedCast.map((c: any) => (
              <Link
                key={c.id}
                href={c.people.slug ? `/person/${c.people.slug}` : "#"}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-[--accent] hover:bg-white/10"
              >
                {c.people.profile_image_url ? (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.people.profile_image_url}
                      alt={c.people.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-md border border-white/10 bg-slate-900 flex items-center justify-center text-sm font-medium text-white/60">
                    {c.people.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white/90 truncate">{c.people.name}</div>
                  {c.character_name ? (
                    <div className="text-xs text-white/60 truncate">as {c.character_name}</div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {Object.keys(crewByRole).length > 0 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">Crew</h2>
          {Object.entries(crewByRole).map(([role, items]) => (
            <div key={role}>
              <h3 className="mb-4 text-lg font-semibold text-white/80">
                {roleLabels[role] || role.charAt(0).toUpperCase() + role.slice(1)}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((c: Credit) => (
                  <Link
                    key={c.id}
                    href={c.people.slug ? `/person/${c.people.slug}` : "#"}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-[--accent] hover:bg-white/10"
                  >
                    {c.people.profile_image_url ? (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.people.profile_image_url}
                          alt={c.people.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-md border border-white/10 bg-slate-900 flex items-center justify-center text-sm font-medium text-white/60">
                        {c.people.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white/90 truncate">{c.people.name}</div>
                      {c.department ? (
                        <div className="text-xs text-white/60 truncate">{c.department}</div>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedCast.length === 0 && Object.keys(crewByRole).length === 0 && (
        <div className="text-center text-sm text-white/60">
          No credits found for this title.
        </div>
      )}
    </div>
  );
}
