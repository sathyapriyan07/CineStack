import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import TitleActions from "@/components/titles/title-actions";

export const dynamic = "force-dynamic";

export default async function TitleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: title } = await supabase
    .from("titles")
    .select(
      "id, title, original_title, overview, type, release_date, runtime, status, age_rating, languages, country, poster_url, backdrop_url"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!title) return notFound();

  const [{ data: trailers }, { data: watchLinks }, { data: musicLinks }, { data: credits }] =
    await Promise.all([
      supabase
        .from("trailers")
        .select("id, youtube_url, label")
        .eq("title_id", title.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("watch_links")
        .select("id, platform, url, region, is_primary")
        .eq("title_id", title.id)
        .order("is_primary", { ascending: false }),
      supabase
        .from("music_links")
        .select("id, platform, url")
        .eq("title_id", title.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("title_credits")
        .select("id, role, character_name, people(id, name, profile_image_url)")
        .eq("title_id", title.id)
        .order("role", { ascending: true }),
    ]);

  return (
    <div className="relative">
      {title.backdrop_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={title.backdrop_url}
          alt={title.title}
          className="pointer-events-none absolute inset-0 h-72 w-full object-cover opacity-30"
        />
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-12 md:pt-10">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/3">
            <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-lg">
              {title.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={title.poster_url}
                  alt={title.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-white/40">
                  No poster
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">{title.title}</h1>
            {title.original_title && title.original_title !== title.title ? (
              <p className="mt-1 text-sm text-white/60">
                Original title: {title.original_title}
              </p>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full bg-white/5 px-3 py-1 uppercase">
                {title.type}
              </span>
              {title.release_date ? <span>{title.release_date.slice(0, 4)}</span> : null}
              {title.runtime ? <span>{title.runtime} min</span> : null}
              {title.age_rating ? (
                <span className="rounded-full border border-white/20 px-2 py-0.5">
                  {title.age_rating}
                </span>
              ) : null}
              {title.country ? <span>{title.country}</span> : null}
              {title.languages?.length ? (
                <span>Languages: {title.languages.join(", ")}</span>
              ) : null}
            </div>

            {title.overview ? (
              <p className="mt-4 max-w-2xl text-sm text-white/85">{title.overview}</p>
            ) : null}

            <div className="mt-6">
              <TitleActions
                titleId={title.id}
                trailers={trailers ?? []}
                watchLinks={watchLinks ?? []}
                musicLinks={musicLinks ?? []}
              />
            </div>
          </div>
        </div>

        {credits && credits.length > 0 ? (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Cast & Crew</h2>
            <CreditsDisplay credits={credits} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CreditsDisplay({ credits }: { credits: any[] }) {
  const grouped = credits.reduce((acc, c) => {
    const role = c.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(c);
    return acc;
  }, {} as Record<string, any[]>);

  const roleLabels: Record<string, string> = {
    actor: "Cast",
    director: "Directors",
    writer: "Writers",
    producer: "Producers",
    composer: "Composers",
    cinematographer: "Cinematographers",
    editor: "Editors",
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([role, items]) => (
        <div key={role}>
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            {roleLabels[role] || role.charAt(0).toUpperCase() + role.slice(1)}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(items as any[]).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                {c.people.profile_image_url ? (
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.people.profile_image_url}
                      alt={c.people.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 flex-shrink-0 rounded-md border border-white/10 bg-slate-900 flex items-center justify-center text-sm font-medium text-white/60">
                    {c.people.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white/90 truncate">{c.people.name}</div>
                  {c.character_name ? (
                    <div className="text-xs text-white/60 truncate">{c.character_name}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

