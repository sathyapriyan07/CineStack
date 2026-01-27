import { createSupabaseServerClient } from "@/lib/supabase/server";
import TitlesFilterBar from "@/components/titles/titles-filter-bar";

export const dynamic = "force-dynamic";

type SearchParams = {
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
  if (sp.type) query = query.eq("type", sp.type);

  // year filter: use date_part for proper year matching
  if (sp.year) query = query.filter("release_date", "gte", `${sp.year}-01-01`).filter("release_date", "lte", `${sp.year}-12-31`);

  if (sp.language) query = query.contains("languages", [sp.language]);

  const { data: titles, count } = await query
    .order("release_date", { ascending: false, nullsFirst: false })
    .range(from, to);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 bg-black min-h-screen">
      <h1 className="mb-8 text-3xl font-bold text-white">Browse All Titles</h1>
      <TitlesFilterBar />
      <div className="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {titles?.map((t) => (
          <a
            key={t.id}
            href={`/titles/${t.slug}`}
            className="group rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="aspect-[2/3] overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10 relative">
              {t.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.poster_url}
                  alt={t.title}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-white/40">
                  No poster
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 rounded-full p-3 transition-all hover:shadow-lg hover:shadow-blue-500/25">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-3 bg-black/20 backdrop-blur-sm border-t border-white/10">
              <div className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">{t.title}</div>
              <div className="text-xs text-white/60 mt-1">{t.type.toUpperCase()} • {t.release_date?.slice(0, 4)}</div>
            </div>
          </a>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const isCurrent = p === page;
            const next = new URLSearchParams(sp as any);
            next.set("page", String(p));
            return (
              <a
                key={p}
                href={`/titles?${next.toString()}`}
                className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                  isCurrent ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "bg-white/5 backdrop-blur-sm text-white/80 hover:bg-white/10 hover:text-blue-400"
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

