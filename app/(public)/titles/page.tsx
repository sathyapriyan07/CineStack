import { createSupabaseServerClient } from "@/lib/supabase/server";
import TitlesFilterBar from "@/components/titles/titles-filter-bar";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  type?: string;
  year?: string;
  language?: string;
  page?: string;
};

const PAGE_SIZE = 18;

export default async function TitlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  const page = Number(sp.page ?? "1");
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("titles")
    .select("id, title, slug, type, poster_url, release_date, languages", {
      count: "exact",
    })
    .eq("is_published", true);

  if (sp.q) query = query.ilike("title", `%${sp.q}%`);
  if (sp.type) query = query.eq("type", sp.type);

  // year filter: use date_part for proper year matching
  if (sp.year) query = query.filter("release_date", "gte", `${sp.year}-01-01`).filter("release_date", "lte", `${sp.year}-12-31`);

  if (sp.language) query = query.contains("languages", [sp.language]);

  const { data: titles, count } = await query
    .order("release_date", { ascending: false, nullsFirst: false })
    .range(from, to);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Browse titles</h1>
      <TitlesFilterBar />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {titles?.map((t) => (
          <a
            key={t.id}
            href={`/titles/${t.slug}`}
            className="group rounded-lg border border-white/10 bg-slate-950/60 p-2 transition hover:border-[--accent] hover:bg-white/5"
          >
            <div className="aspect-[2/3] overflow-hidden rounded-md bg-slate-900">
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
            <div className="mt-2 text-xs text-white/60">{t.type.toUpperCase()}</div>
            <div className="text-sm font-medium text-white/90 line-clamp-2">{t.title}</div>
            <div className="text-xs text-white/50">{t.release_date?.slice(0, 4)}</div>
          </a>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const isCurrent = p === page;
            const next = new URLSearchParams(sp as any);
            next.set("page", String(p));
            return (
              <a
                key={p}
                href={`/titles?${next.toString()}`}
                className={`rounded-md px-3 py-1 ${
                  isCurrent ? "bg-[--accent] text-black" : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {p}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

