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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[44vh] flex flex-col items-center justify-center bg-black">
        {/* Profile Image */}
        <div className="w-35 h-35 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-2xl mb-4 border-4 border-gray-900 bg-gray-800 flex items-center justify-center">
          {person.profile_image_url ? (
            <img
              src={person.profile_image_url}
              alt={person.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-5xl md:text-7xl font-bold text-white">
              {person.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {/* Name */}
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">{person.name}</h1>
        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-4">
          <button className="px-4 py-2 rounded-full bg-white text-black font-semibold text-sm shadow transition-all">Biography</button>
          <button className="px-4 py-2 rounded-full bg-gray-800 text-white font-semibold text-sm shadow transition-all">Filmography</button>
        </div>
        {/* Meta Information */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-4 text-sm">
          {person.birth_date && (
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(person.birth_date).getFullYear()}
                {person.death_date && ` - ${new Date(person.death_date).getFullYear()}`}
              </span>
            </div>
          )}
          {person.birth_place && (
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{person.birth_place}</span>
            </div>
          )}
          {person.popularity && (
            <div className="flex items-center gap-1 text-gray-400">
              <Star className="h-4 w-4" />
              <span>Popularity: {person.popularity.toFixed(1)}</span>
            </div>
          )}
        </div>
        {/* Known For Department */}
        {person.known_for_department && (
          <Badge variant="secondary" className="text-white mb-2">
            {person.known_for_department}
          </Badge>
        )}
        {/* Biography */}
        {person.biography && (
          <div className="max-w-md mx-auto">
            <p className="text-gray-300 leading-relaxed text-center space-y-3">
              {person.biography}
            </p>
          </div>
        )}
      </div>

      {/* Filmography Section */}
      {filmography.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Filmography</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {filmography.map((title: any) => (
              <div key={title.id} className="flex flex-col items-center snap-start w-27.5">
                <TitleCard
                  id={title.id}
                  title={title.title}
                  type={title.type}
                  slug={title.slug}
                  poster_url={title.poster_url}
                  rating={title.rating}
                  release_date={title.release_date}
                  size="sm"
                />
                {/* Roles */}
                <div className="space-y-1 mt-1">
                  {title.castRoles.slice(0, 1).map((role: any, index: number) => (
                    <div key={index} className="text-xs text-gray-400 text-center">
                      <span className="text-white font-medium">{role.character_name}</span>
                      {role.billing_order && role.billing_order <= 5 && (
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          #{role.billing_order}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {title.crewRoles.slice(0, 1).map((role: any, index: number) => (
                    <div key={index} className="text-xs text-gray-400 text-center">
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
                <div key={image.id} className="aspect-3/4 rounded-lg overflow-hidden bg-gray-800">
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
