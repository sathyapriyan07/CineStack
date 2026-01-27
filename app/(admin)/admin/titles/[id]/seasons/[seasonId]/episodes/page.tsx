import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Eye, EyeOff } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; seasonId: string }>;
}

export default async function AdminSeasonEpisodesPage({ params }: PageProps) {
  const { id, seasonId } = await params;
  const supabase = await createSupabaseServerClient();

  // Get title and season info
  const { data: title } = await supabase
    .from("titles")
    .select("id, title, type")
    .eq("id", id)
    .single();

  const { data: season } = await supabase
    .from("seasons")
    .select("id, season_number, title")
    .eq("id", seasonId)
    .single();

  if (!title || !season || title.type !== "series") return notFound();

  // Get episodes
  const { data: episodes } = await supabase
    .from("episodes")
    .select(`
      id,
      episode_number,
      title,
      overview,
      runtime,
      air_date,
      still_url,
      video_url,
      is_published,
      created_at
    `)
    .eq("season_id", seasonId)
    .order("episode_number");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/titles/${id}/seasons`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Seasons
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {title.title} - Season {season.season_number}
              {season.title && ` (${season.title})`}
            </h1>
            <p className="text-xs text-white/60">Manage episodes for this season.</p>
          </div>
        </div>
        <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-medium">
          <Link href={`/admin/titles/${id}/seasons/${seasonId}/episodes/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Episode
          </Link>
        </Button>
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        {episodes?.map((episode) => (
          <div
            key={episode.id}
            className="rounded-xl border border-white/10 bg-black/20 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Episode Still */}
                <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                  {episode.still_url ? (
                    <img
                      src={episode.still_url}
                      alt={`Episode ${episode.episode_number}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/40">
                      E{episode.episode_number}
                    </div>
                  )}
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Episode {episode.episode_number}: {episode.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {episode.is_published ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-200">
                          <Eye className="h-3 w-3" />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-gray-500/20 px-2 py-1 text-xs text-gray-200">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {episode.overview && (
                    <p className="text-sm text-white/70 line-clamp-2 mb-2">
                      {episode.overview}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-white/60">
                    {episode.runtime && (
                      <span>{episode.runtime} min</span>
                    )}
                    {episode.air_date && (
                      <span>Aired: {new Date(episode.air_date).toLocaleDateString()}</span>
                    )}
                    {episode.video_url && (
                      <span className="text-green-400">Has video</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/titles/${id}/seasons/${seasonId}/episodes/${episode.id}/edit`}>
                    Edit
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/titles/${id}/seasons/${seasonId}/episodes/${episode.id}/upload`}>
                    Upload Media
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {(!episodes || episodes.length === 0) && (
          <div className="rounded-xl border border-dashed border-white/20 bg-black/10 p-12 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold text-white mb-2">No episodes yet</h3>
            <p className="text-white/60 mb-4">Start by adding the first episode for this season.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href={`/admin/titles/${id}/seasons/${seasonId}/episodes/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Episode
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}