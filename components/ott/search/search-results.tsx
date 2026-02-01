"use client";

// UI import replaced with basic HTML element

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
    <section className="space-y-2">
      {/* Title */}
      <h2 className="text-sm font-semibold text-white tracking-tight">{title}</h2>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {results.map((result) => (
          <GlassPosterCard
            key={result.id}
            id={result.id}
            title={result.title}
            type={result.type}
            slug={result.id}
            poster_url={result.poster}
            rating={result.rating}
            release_date={result.year}
            size="sm"
            className="w-full"
          />
        ))}
      </div>

      {/* Load More Button (if search results) */}
      {isSearchResult && results.length >= 6 && (
        <div className="flex justify-center pt-3">
          <button className="rounded-full bg-white/10 px-5 py-2 text-xs font-medium text-white/80 hover:bg-white/20 transition-colors">
            Load More
          </button>
        </div>
      )}
    </section>
  );
}