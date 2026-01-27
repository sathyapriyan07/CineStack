import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTitleSeasonsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Get title info
  const { data: title } = await supabase
    .from("titles")
    .select("id, title, type")
    .eq("id", id)
    .single();

  if (!title) return notFound();
  if (title.type !== "series") return notFound();

  // Get seasons
  const { data: seasons } = await supabase
    .from("seasons")
    .select(`
      id,
      season_number,
      title,
      overview,
      poster_url,
      release_date,
      created_at,
      episodes:episodes(count)
    `)
    .eq("title_id", id)
    .order("season_number");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/titles/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Title
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{title.title} - Seasons</h1>
            <p className="text-xs text-white/60">Manage seasons and episodes.</p>
          </div>
        </div>
        <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-medium">
          <Link href={`/admin/titles/${id}/seasons/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Season
          </Link>
        </Button>
      </div>

      {/* Seasons List */}
      <div className="space-y-4">
        {seasons?.map((season) => (
          <div
            key={season.id}
            className="rounded-xl border border-white/10 bg-black/20 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Season Poster */}
                <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                  {season.poster_url ? (
                    <img
                      src={season.poster_url}
                      alt={`Season ${season.season_number}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/40">
                      S{season.season_number}
                    </div>
                  )}
                </div>

                {/* Season Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Season {season.season_number}
                      {season.title && ` - ${season.title}`}
                    </h3>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                      {season.episodes?.[0]?.count || 0} episodes
                    </span>
                  </div>

                  {season.overview && (
                    <p className="text-sm text-white/70 line-clamp-2 mb-2">
                      {season.overview}
                    </p>
                  )}

                  {season.release_date && (
                    <p className="text-xs text-white/60">
                      Released: {new Date(season.release_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/titles/${id}/seasons/${season.id}/episodes`}>
                    Manage Episodes
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/titles/${id}/seasons/${season.id}/edit`}>
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {(!seasons || seasons.length === 0) && (
          <div className="rounded-xl border border-dashed border-white/20 bg-black/10 p-12 text-center">
            <div className="text-4xl mb-4">📺</div>
            <h3 className="text-lg font-semibold text-white mb-2">No seasons yet</h3>
            <p className="text-white/60 mb-4">Start by adding the first season for this series.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href={`/admin/titles/${id}/seasons/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Season
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}