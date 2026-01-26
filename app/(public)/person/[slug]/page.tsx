import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: person } = await supabase
    .from("people")
    .select("id, name, profile_image_url, bio, slug")
    .eq("slug", slug)
    .single();

  if (!person) return notFound();

  // Get all credits for this person
  const { data: credits } = await supabase
    .from("title_credits")
    .select(
      "id, role, character_name, billing_order, department, titles!inner(id, title, type, slug, poster_url, release_date, is_published)"
    )
    .eq("person_id", person.id)
    .order("titles.release_date", { ascending: false, nullsLast: true });

  // Separate cast and crew
  const castCredits = (credits ?? []).filter(
    (c: any) => c.role === "actor" && c.titles?.is_published
  );
  const crewCredits = (credits ?? []).filter(
    (c: any) => c.role !== "actor" && c.titles?.is_published
  );

  // Sort cast by billing_order, then by release_date
  const sortedCastCredits = [...castCredits].sort((a: any, b: any) => {
    // First sort by billing_order (lower = higher priority)
    const aOrder = a.billing_order ?? 9999;
    const bOrder = b.billing_order ?? 9999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Then by release_date (newer first)
    const aDate = a.titles?.release_date || "";
    const bDate = b.titles?.release_date || "";
    if (aDate && bDate) return bDate.localeCompare(aDate);
    if (aDate) return -1;
    if (bDate) return 1;
    return 0;
  });

  // Group crew by role
  const crewByRole = crewCredits.reduce((acc: any, c: any) => {
    const role = c.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(c);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort each crew role group by release_date (newer first)
  Object.keys(crewByRole).forEach((role) => {
    crewByRole[role].sort((a: any, b: any) => {
      const aDate = a.titles?.release_date || "";
      const bDate = b.titles?.release_date || "";
      if (aDate && bDate) return bDate.localeCompare(aDate);
      if (aDate) return -1;
      if (bDate) return 1;
      return 0;
    });
  });

  const roleLabels: Record<string, string> = {
    director: "Director",
    writer: "Writer",
    producer: "Producer",
    composer: "Music Director / Composer",
    music_director: "Music Director",
    cinematographer: "Cinematographer",
    editor: "Editor",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-1/3">
          <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-lg">
            {person.profile_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.profile_image_url}
                alt={person.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl font-semibold text-white/40">
                {person.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">{person.name}</h1>
          {person.bio ? (
            <div className="mt-4">
              <h2 className="mb-2 text-lg font-semibold">Biography</h2>
              <p className="text-sm leading-relaxed text-white/85">{person.bio}</p>
            </div>
          ) : null}
        </div>
      </div>

      {castCredits.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Acting Credits</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {castCredits.map((credit: any) => (
              <Link
                key={credit.id}
                href={`/titles/${credit.titles.slug}`}
                className="group rounded-lg border border-white/10 bg-slate-950/60 p-2 transition hover:border-[--accent] hover:bg-white/5"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-md bg-slate-900">
                  {credit.titles.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={credit.titles.poster_url}
                      alt={credit.titles.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/40">
                      No poster
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-white/60">
                  {credit.titles.release_date?.slice(0, 4) || "TBA"}
                </div>
                <div className="text-sm font-medium text-white/90 line-clamp-2">
                  {credit.titles.title}
                </div>
                {credit.character_name && (
                  <div className="mt-1 text-xs text-white/60">as {credit.character_name}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {Object.keys(crewByRole).length > 0 && (
        <div className="mt-10 space-y-8">
          <h2 className="text-xl font-semibold">Crew Credits</h2>
          {Object.entries(crewByRole).map(([role, items]) => (
            <div key={role}>
              <h3 className="mb-4 text-lg font-semibold text-white/80">
                {roleLabels[role] || role.charAt(0).toUpperCase() + role.slice(1)}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((credit: any) => (
                  <Link
                    key={credit.id}
                    href={`/titles/${credit.titles.slug}`}
                    className="group rounded-lg border border-white/10 bg-slate-950/60 p-2 transition hover:border-[--accent] hover:bg-white/5"
                  >
                    <div className="aspect-[2/3] overflow-hidden rounded-md bg-slate-900">
                      {credit.titles.poster_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={credit.titles.poster_url}
                          alt={credit.titles.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-white/40">
                          No poster
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      {credit.titles.release_date?.slice(0, 4) || "TBA"}
                    </div>
                    <div className="text-sm font-medium text-white/90 line-clamp-2">
                      {credit.titles.title}
                    </div>
                    {credit.department && (
                      <div className="mt-1 text-xs text-white/60">{credit.department}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedCastCredits.length === 0 && Object.keys(crewByRole).length === 0 && (
        <div className="mt-10 text-center text-sm text-white/60">
          No credits found for this person.
        </div>
      )}
    </div>
  );
}
