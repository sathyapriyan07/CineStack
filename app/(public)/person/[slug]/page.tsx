import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Star } from "lucide-react";
import { getPersonDetails } from "@/lib/db/queries";
import { TitleCard } from "@/components/ui/title-card";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const person = await getPersonDetails(supabase, slug);

  if (!person) return notFound();

  // Separate cast and crew credits
  const castCredits = person.cast || [];
  const crewCredits = person.crew || [];

  // Group credits by title to avoid duplicates
  const titleMap = new Map();

  // Process cast credits
  castCredits.forEach((credit: any) => {
    const titleId = credit.titles.id;
    if (!titleMap.has(titleId)) {
      titleMap.set(titleId, {
        ...credit.titles,
        castRoles: [],
        crewRoles: []
      });
    }
    titleMap.get(titleId).castRoles.push({
      character_name: credit.character_name,
      billing_order: credit.billing_order
    });
  });

  // Process crew credits
  crewCredits.forEach((credit: any) => {
    const titleId = credit.titles.id;
    if (!titleMap.has(titleId)) {
      titleMap.set(titleId, {
        ...credit.titles,
        castRoles: [],
        crewRoles: []
      });
    }
    titleMap.get(titleId).crewRoles.push({
      department: credit.department,
      job: credit.job
    });
  });

  const filmography = Array.from(titleMap.values())
    .sort((a, b) => new Date(b.release_date || "1900-01-01").getTime() - new Date(a.release_date || "1900-01-01").getTime());

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto max-w-6xl px-6 w-full">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {person.profile_image_url ? (
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={person.profile_image_url}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-white shadow-2xl bg-gray-700 flex items-center justify-center">
                    <span className="text-6xl md:text-8xl font-bold text-white">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Person Info */}
              <div className="flex-1 text-center md:text-left text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{person.name}</h1>

                {/* Known For Department */}
                {person.known_for_department && (
                  <Badge variant="secondary" className="text-white mb-4">
                    {person.known_for_department}
                  </Badge>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-6 text-sm">
                  {person.birth_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(person.birth_date).getFullYear()}
                        {person.death_date && ` - ${new Date(person.death_date).getFullYear()}`}
                      </span>
                    </div>
                  )}

                  {person.birth_place && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{person.birth_place}</span>
                    </div>
                  )}

                  {person.popularity && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>Popularity: {person.popularity.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Biography */}
                {person.biography && (
                  <div className="max-w-3xl">
                    <h2 className="text-xl font-semibold mb-3">Biography</h2>
                    <p className="text-gray-200 leading-relaxed">
                      {person.biography}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Filmography */}
        {filmography.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Filmography</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filmography.map((title: any) => (
                <div key={title.id} className="space-y-2">
                  <TitleCard
                    id={title.id}
                    title={title.title}
                    type={title.type}
                    slug={title.slug}
                    poster_url={title.poster_url}
                    rating={title.rating}
                    release_date={title.release_date}
                    size="md"
                  />

                  {/* Roles */}
                  <div className="space-y-1">
                    {title.castRoles.slice(0, 2).map((role: any, index: number) => (
                      <div key={index} className="text-sm text-gray-400">
                        <span className="text-white font-medium">{role.character_name}</span>
                        {role.billing_order && role.billing_order <= 5 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            #{role.billing_order}
                          </Badge>
                        )}
                      </div>
                    ))}

                    {title.crewRoles.slice(0, 2).map((role: any, index: number) => (
                      <div key={index} className="text-sm text-gray-400">
                        <span className="text-white font-medium">{role.job}</span>
                        <span className="text-gray-500"> • {role.department}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Images */}
        {person.images && person.images.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Photos</h2>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {person.images.slice(0, 8).map((image: any) => (
                <div key={image.id} className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={image.file_path}
                    alt={`${person.name} photo`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
