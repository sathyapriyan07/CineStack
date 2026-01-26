import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RatingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/ratings");

  const { data: rows } = await supabase
    .from("ratings")
    .select("id, rating, created_at, titles!inner(id, title, slug, type, poster_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your ratings</h1>
        <Button asChild size="sm" variant="outline">
          <a href="/titles">Browse</a>
        </Button>
      </div>
      {!rows?.length ? (
        <p className="text-sm text-white/60">
          No ratings yet. Rate titles from a title page.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((r: any) => (
            <a
              key={r.id}
              href={`/titles/${r.titles.slug}`}
              className="group rounded-lg border border-white/10 bg-slate-950/60 p-2 transition hover:border-[--accent] hover:bg-white/5"
            >
              <div className="aspect-[2/3] overflow-hidden rounded-md bg-slate-900">
                {r.titles.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.titles.poster_url}
                    alt={r.titles.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/40">
                    No poster
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                <span>{String(r.titles.type).toUpperCase()}</span>
                <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-yellow-200">
                  {r.rating}/10
                </span>
              </div>
              <div className="text-sm font-medium text-white/90 line-clamp-2">
                {r.titles.title}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

