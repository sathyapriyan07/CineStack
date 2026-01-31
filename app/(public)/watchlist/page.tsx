import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/watchlist");

  const { data: items } = await supabase
    .from("watchlist")
    .select("id, created_at, titles!inner(id, title, slug, type, poster_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = (items ?? []).map((i: any) => i.titles);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your watchlist</h1>
        <Button asChild size="sm" variant="outline">
          <Link href="/titles">Browse</Link>
        </Button>
      </div>
      {!list.length ? (
        <p className="text-sm text-white/60">
          No items yet. Add titles to your watchlist from a title page.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((t: any) => (
            <a
              key={t.id}
              href={`/titles/${t.slug}`}
              className="group rounded-lg border border-white/10 bg-slate-950/60 p-2 transition hover:border-[--accent] hover:bg-white/5"
            >
              <div className="aspect-2/3 overflow-hidden rounded-md bg-slate-900">
                {t.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.poster_url}
                    alt={t.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/40">
                    No poster
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-white/60">
                {String(t.type).toUpperCase()}
              </div>
              <div className="text-sm font-medium text-white/90 line-clamp-2">
                {t.title}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

