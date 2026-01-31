"use client";

import { useState } from "react";
import { Suspense } from "react";
import SearchBar from "@/components/ott/search/search-bar";
import RecentSearches from "@/components/ott/search/recent-searches";
import TrendingFilters from "@/components/ott/search/trending-filters";
import SearchResults from "@/components/ott/search/search-results";
import BottomNavigation from "@/components/ott/bottom-navigation";
import { SkeletonLoader } from "@/components/ott/skeleton-loader";

interface RecentSearch {
  id: string;
  title: string;
  poster: string;
  type: "movie" | "series";
}

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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("India");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);

  // Load trending/popular titles for default view
  // useEffect(() => {
    const fetchTrendingTitles = async () => {
      try {
        // const supabase = createSupabaseClient();

        const { data: titles, error } = await supabase
          .from("titles")
          .select("id, title, poster_url, release_date, vote_average, type, slug")
          .eq("is_published", true)
          .order("vote_average", { ascending: false })
          .limit(10);

        if (!error && titles) {
          const formattedResults = titles.map((title: any) => ({
            id: title.id,
            title: title.title,
            poster: title.poster_url,
            type: title.type as "movie" | "series",
            year: title.release_date?.split('-')[0] || 'TBA',
            rating: title.vote_average || 0,
            isNew: title.release_date && new Date(title.release_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // New if released in last year
            hasNewEpisodes: title.type === 'series' && Math.random() > 0.5, // Random for demo
          }));
          setSearchResults(formattedResults);
        }
      } catch (error) {
        console.error("Error fetching trending titles:", error);
      }
    };

    fetchTrendingTitles();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);

    if (query.length > 0) {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.results) {
          const formattedResults = data.results.map((result: any) => ({
            id: result.id,
            title: result.title,
            poster: result.poster_url || result.profile_image_url || "/api/placeholder/200/300",
            type: result.type === "person" ? "movie" : (result.type as "movie" | "series"), // Handle person type
            year: result.release_date?.split('-')[0] || result.birth_date?.split('-')[0] || 'TBA',
            rating: result.vote_average || 0,
            isNew: result.release_date && new Date(result.release_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            hasNewEpisodes: result.type === 'series' && Math.random() > 0.5,
          }));
          setSearchResults(formattedResults);
        }
      } catch (error) {
        console.error("Error searching:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const clearRecentSearches = () => {
    // In real app, this would clear from localStorage or API
    console.log("Clearing recent searches");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-black">
      {/* Search Bar - Sticky Top */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {!isSearching ? (
          // Default state - Recent searches and trending
          <div className="space-y-8 px-4 pt-4">
            {/* Recent Searches */}
            <Suspense fallback={<SkeletonLoader type="section" />}>
              <RecentSearches
                searches={recentSearches}
                onClearAll={clearRecentSearches}
              />
            </Suspense>

            {/* Trending In Section */}
            <Suspense fallback={<SkeletonLoader type="section" />}>
              <TrendingFilters
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
              />
            </Suspense>

            {/* Trending Results */}
            <Suspense fallback={<SkeletonLoader type="section" />}>
              <SearchResults
                results={searchResults}
                title="Trending in India"
              />
            </Suspense>
          </div>
        ) : (
          // Search results state
          <div className="px-4 pt-4">
            <Suspense fallback={<SkeletonLoader type="section" />}>
              <SearchResults
                results={searchResults.filter(result =>
                  result.title.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                title={`Search results for "${searchQuery}"`}
                isSearchResult={true}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="search" />
    </div>
  );
}