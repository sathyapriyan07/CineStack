import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import TitleActions from "@/components/titles/title-actions";
import Link from "next/link";
import { TrackView } from "@/components/titles/track-view";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, Globe } from "lucide-react";
import { getTitleDetails } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function TitleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const title = await getTitleDetails(supabase, slug);

  if (!title) return notFound();

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <TrackView titleId={title.id} />

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {title.backdrop_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={title.backdrop_url}
            alt={title.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-gray-900 to-black"></div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-linear-to-r from-[#0f0f0f]/80 via-transparent to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-end pb-12">
          <div className="mx-auto max-w-6xl px-6 w-full">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Poster */}
              <div className="shrink-0">
                <div className="w-48 md:w-64 aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl">
                  {title.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={title.poster_url}
                      alt={title.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-700 rounded-2xl">
                      <div className="text-center text-gray-500">
                        <div className="text-6xl mb-4">🎬</div>
                        <div className="text-sm">No poster</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Info */}
              <div className="flex-1 text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-2">{title.title}</h1>

                {title.original_title && title.original_title !== title.title ? (
                  <p className="text-lg text-gray-300 mb-4">
                    {title.original_title}
                  </p>
                ) : null}

                {/* Rating and Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {title.rating && (
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{title.rating.toFixed(1)}</span>
                      {title.vote_count && (
                        <span className="text-sm text-gray-300">({title.vote_count})</span>
                      )}
                    </div>
                  )}

                  <Badge variant="secondary" className="text-white border-white/20">
                    {title.type === "movie" ? "Movie" : "TV Series"}
                  </Badge>

                  {title.status && (
                    <Badge variant="outline" className="text-white border-white/30">
                      {title.status}
                    </Badge>
                  )}

                  {title.release_date && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(title.release_date).getFullYear()}</span>
                    </div>
                  )}

                  {title.runtime && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>{title.runtime} min</span>
                    </div>
                  )}

                  {title.country && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Globe className="h-4 w-4" />
                      <span>{title.country}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {title.genres && title.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {title.genres.map((genre: any) => (
                      <Badge key={genre.slug} variant="outline" className="text-white border-white/30 hover:bg-white/10">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tagline */}
                {title.tagline && (
                  <p className="text-xl italic text-gray-200 mb-4">
                    "{title.tagline}"
                  </p>
                )}

                {/* Overview */}
                {title.overview && (
                  <p className="text-lg text-gray-200 max-w-2xl leading-relaxed mb-8">
                    {title.overview}
                  </p>
                )}

                <TitleActions
                  titleId={title.id}
                  trailers={title.trailers}
                  watchLinks={[]} // TODO: Update with new structure
                  musicLinks={[]} // TODO: Update with new structure
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Content Section */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Cast & Crew Section */}
        {(title.cast.length > 0 || title.crew.length > 0) && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Cast & Crew</h2>
              <Link
                href={`/titles/${slug}/credits`}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <CreditsDisplay cast={title.cast} crew={title.crew} showTopBilled={true} />
          </div>
        )}

        {/* Seasons Section for TV Shows */}
        {title.seasons && title.seasons.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Seasons</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {title.seasons.map((season: any) => (
                <div key={season.id} className="bg-gray-800/50 rounded-xl p-6">
                  <div className="flex gap-4">
                    {season.poster_url && (
                      <div className="flex-shrink-0 w-20 aspect-[2/3] rounded-lg overflow-hidden">
                        <img
                          src={season.poster_url}
                          alt={`Season ${season.season_number}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg">
                        Season {season.season_number}
                      </h3>
                      {season.title && season.title !== `Season ${season.season_number}` && (
                        <p className="text-gray-300 text-sm mb-2">{season.title}</p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {season.episodes?.length || 0} episodes
                        {season.release_date && ` • ${new Date(season.release_date).getFullYear()}`}
                      </p>
                      {season.overview && (
                        <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                          {season.overview}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collection Section */}
        {title.collections && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Part of the Collection</h2>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex gap-6">
                {title.collections.poster_url && (
                  <div className="flex-shrink-0 w-32 aspect-[2/3] rounded-lg overflow-hidden">
                    <img
                      src={title.collections.poster_url}
                      alt={title.collections.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-xl mb-2">
                    {title.collections.name}
                  </h3>
                  {title.collections.overview && (
                    <p className="text-gray-300 mb-4">{title.collections.overview}</p>
                  )}
                  <Link
                    href={`/collections/${title.collections.slug}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    View Collection →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Section */}
        {title.media && title.media.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Media</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {title.media.slice(0, 6).map((media: any) => (
                <div key={media.id} className="aspect-video rounded-lg overflow-hidden bg-gray-800">
                  {media.file_type === 'backdrop' && (
                    <img
                      src={media.file_path}
                      alt="Backdrop"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {media.file_type === 'poster' && (
                    <img
                      src={media.file_path}
                      alt="Poster"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {media.file_type === 'still' && (
                    <img
                      src={media.file_path}
                      alt="Still"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditsDisplay({ cast, crew, showTopBilled = false }: { cast: any[]; crew: any[]; showTopBilled?: boolean }) {
  // Group crew by department
  const crewByDepartment = crew.reduce((acc, c) => {
    const dept = c.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(c);
    return acc;
  }, {} as Record<string, any[]>);

  const departmentLabels: Record<string, string> = {
    Directing: "Directors",
    Writing: "Writers",
    Production: "Producers",
    Sound: "Sound",
    Camera: "Cinematography",
    Editing: "Editors",
    Art: "Art Department",
    Costume: "Costume & Make-Up",
    Visual: "Visual Effects",
  };

  // Show top 8 cast members if showTopBilled
  const displayCast = showTopBilled ? cast.slice(0, 8) : cast;

  return (
    <div className="space-y-12">
      {displayCast.length > 0 && (
        <div>
          <h3 className="mb-6 text-lg font-semibold text-white">Top Billed Cast</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayCast.map((c: any) => (
              <Link
                key={c.id}
                href={`/person/${c.people.slug}`}
                className="group flex items-center gap-4 rounded-xl bg-gray-800/50 p-4 transition-all duration-200 hover:bg-gray-700/50 hover:scale-105"
              >
                {c.people.profile_image_url ? (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-600 group-hover:border-white transition-colors duration-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.people.profile_image_url}
                      alt={c.people.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-300 group-hover:border-white transition-colors duration-200">
                    {c.people.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium truncate group-hover:text-gray-200 transition-colors duration-200">
                    {c.people.name}
                  </div>
                  <div className="text-sm text-gray-400 truncate mt-1">
                    {c.character_name}
                  </div>
                  {c.people.known_for_department && (
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {c.people.known_for_department}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {Object.entries(crewByDepartment).slice(0, showTopBilled ? 3 : undefined).map(([department, items]) => (
        <div key={department}>
          <h3 className="mb-6 text-lg font-semibold text-white">
            {departmentLabels[department] || department}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(items as any[]).slice(0, showTopBilled ? 4 : undefined).map((c: any) => (
              <Link
                key={c.id}
                href={`/person/${c.people.slug}`}
                className="group flex items-center gap-4 rounded-xl bg-gray-800/50 p-4 transition-all duration-200 hover:bg-gray-700/50 hover:scale-105"
              >
                {c.people.profile_image_url ? (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-600 group-hover:border-white transition-colors duration-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.people.profile_image_url}
                      alt={c.people.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-300 group-hover:border-white transition-colors duration-200">
                    {c.people.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium truncate group-hover:text-gray-200 transition-colors duration-200">
                    {c.people.name}
                  </div>
                  <div className="text-sm text-gray-400 truncate mt-1">
                    {c.job}
                  </div>
                  {c.people.known_for_department && (
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {c.people.known_for_department}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

