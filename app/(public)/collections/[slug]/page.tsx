import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getCollectionDetails } from "@/lib/db/queries";
import { TitleCard } from "@/components/ui/title-card";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const collection = await getCollectionDetails(supabase, slug);

  if (!collection) return notFound();

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        {collection.backdrop_url ? (
          <img
            src={collection.backdrop_url}
            alt={collection.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/80 via-transparent to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-end pb-12">
          <div className="mx-auto max-w-6xl px-6 w-full">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="w-48 md:w-64 aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl">
                  {collection.poster_url ? (
                    <img
                      src={collection.poster_url}
                      alt={collection.name}
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

              {/* Collection Info */}
              <div className="flex-1 text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{collection.name}</h1>

                {/* Overview */}
                {collection.overview && (
                  <p className="text-lg text-gray-200 max-w-2xl leading-relaxed">
                    {collection.overview}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-6">
                  <p className="text-gray-300">
                    {collection.titles.length} {collection.titles.length === 1 ? 'title' : 'titles'} in this collection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Titles in Collection */}
        {collection.titles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Titles in Collection</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collection.titles.map((title: any) => (
                <TitleCard
                  key={title.id}
                  id={title.id}
                  title={title.title}
                  type={title.type}
                  slug={title.slug}
                  poster_url={title.poster_url}
                  rating={title.rating}
                  release_date={title.release_date}
                  overview={title.overview}
                  size="lg"
                />
              ))}
            </div>
          </div>
        )}

        {collection.titles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No titles found in this collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}