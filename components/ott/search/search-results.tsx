"use client";

interface SearchResult {
  id: string;
  title: string;
  poster: string;
  type: "movie" | "series";
  year: string;
  rating: number;
  isNew?: boolean;
  hasNewEpisodes?: boolean;
}

interface SearchResultsProps {
  results: SearchResult[];
  title: string;
  isSearchResult?: boolean;
}

export default function SearchResults({ results, title, isSearchResult = false }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">🔍</div>
        <h3 className="mb-2 text-lg font-semibold text-white">No results found</h3>
        <p className="text-white/60">Try searching for something else</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {/* Title */}
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="group cursor-pointer"
          >
            {/* Poster Card */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-transform group-hover:scale-105">
              <img
                src={result.poster}
                alt={result.title}
                className="h-full w-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {result.isNew && (
                  <span className="rounded bg-gradient-to-r from-blue-600 to-pink-600 px-2 py-1 text-xs font-bold text-white shadow-lg">
                    NEW RELEASE
                  </span>
                )}
                {result.hasNewEpisodes && (
                  <span className="rounded bg-gradient-to-r from-green-600 to-blue-600 px-2 py-1 text-xs font-bold text-white shadow-lg">
                    NEW EPISODES
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                <span className="text-yellow-400">⭐</span>
                <span>{result.rating}</span>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <div className="h-0 w-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1" />
                </div>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                  {result.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <span className="capitalize">{result.type}</span>
                  <span>•</span>
                  <span>{result.year}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button (if search results) */}
      {isSearchResult && results.length >= 6 && (
        <div className="flex justify-center pt-4">
          <button className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white/80 hover:bg-white/20 transition-colors">
            Load More
          </button>
        </div>
      )}
    </section>
  );
}