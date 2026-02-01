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
    <div className="min-h-screen bg-black">
      <TrackView titleId={title.id} />

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden flex flex-col items-center justify-center">
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
        <div className="relative z-10 flex flex-col items-center justify-center h-full pb-8">
          {/* Poster */}
          <div className="w-40 md:w-45 aspect-2/3 overflow-hidden rounded-2xl shadow-2xl mb-4">
            {title.poster_url ? (
              <img
                src={title.poster_url}
                alt={title.title}
                className="h-full w-full object-cover"
                loading="lazy"
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
          {/* Title + Year */}
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">{title.title}</h1>
          {title.release_date && (
            <div className="text-base text-gray-400 text-center mb-2">
              {new Date(title.release_date).getFullYear()}
            </div>
          )}
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <button className="px-4 py-2 rounded-full bg-white text-black font-semibold text-sm shadow transition-all">Overview</button>
            <button className="px-4 py-2 rounded-full bg-gray-800 text-white font-semibold text-sm shadow transition-all">Cast & Crew</button>
            <button className="px-4 py-2 rounded-full bg-gray-800 text-white font-semibold text-sm shadow transition-all">External Links</button>
          </div>
          {/* Overview */}
          {title.overview && (
            <p className="text-base text-gray-300 max-w-md mx-auto leading-relaxed mb-6 text-center">
              {title.overview}
            </p>
          )}
        </div>
      </div>

      {/* Cast & Crew Section */}
      {(title.cast.length > 0 || title.crew.length > 0) && (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Cast & Crew</h2>
          {/* Horizontal avatar row for cast */}
          {title.cast.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth scrollbar-hide mb-6">
              {title.cast.slice(0, 8).map((c: any) => (
                <div key={c.id} className="flex flex-col items-center snap-start w-16">
                  {c.people.profile_image_url ? (
                    <img src={c.people.profile_image_url} alt={c.people.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-700 mb-1" loading="lazy" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-300 mb-1">
                      {c.people.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-xs text-white text-center truncate w-14">{c.people.name}</div>
                  <div className="text-[10px] text-gray-400 text-center truncate w-14">{c.character_name}</div>
                </div>
              ))}
            </div>
          )}
          {/* Crew row below cast */}
          {title.crew.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {title.crew.slice(0, 6).map((c: any) => (
                <div key={c.id} className="bg-gray-800 rounded-xl px-3 py-2 flex flex-col items-center min-w-20">
                  <div className="text-xs text-white font-semibold text-center truncate w-16">{c.people.name}</div>
                  <div className="text-[10px] text-gray-400 text-center truncate w-16">{c.job}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-600 group-hover:border-white transition-colors duration-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.people.profile_image_url}
                      alt={c.people.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-300 group-hover:border-white transition-colors duration-200">
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
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-600 group-hover:border-white transition-colors duration-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.people.profile_image_url}
                      alt={c.people.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-300 group-hover:border-white transition-colors duration-200">
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

