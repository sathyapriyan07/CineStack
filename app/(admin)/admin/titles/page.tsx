import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminTitlesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: titles } = await supabase
    .from("titles")
    .select("id, title, slug, type, is_published, release_date, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Titles</h1>
          <p className="text-xs text-white/60">Create and edit movies and series.</p>
        </div>
        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
          <Link href="/admin/titles/new">+ New title</Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-black/30 text-white/60">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {titles?.map((t) => (
              <tr key={t.id} className="border-b border-white/5 odd:bg-white/[0.02]">
                <td className="px-3 py-2 text-sm text-white/90">{t.title}</td>
                <td className="px-3 py-2 capitalize text-white/70">{t.type}</td>
                <td className="px-3 py-2 text-white/60">{t.release_date?.slice(0, 4)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                      t.is_published
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-red-500/20 text-red-200"
                    }`}
                  >
                    {t.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/titles/${t.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {!titles?.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-xs text-white/50">
                  No titles yet. Click &quot;New title&quot; to create one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

