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

  // Mock recent searches data
  const [recentSearches] = useState<RecentSearch[]>([
    { id: "1", title: "Dune: Part Two", poster: "/api/placeholder/100/150", type: "movie" },
    { id: "2", title: "Stranger Things", poster: "/api/placeholder/100/150", type: "series" },
    { id: "3", title: "Oppenheimer", poster: "/api/placeholder/100/150", type: "movie" },
    { id: "4", title: "The Crown", poster: "/api/placeholder/100/150", type: "series" },
  ]);

  // Mock search results
  const [searchResults] = useState<SearchResult[]>([
    {
      id: "1",
      title: "Dune: Part Two",
      poster: "/api/placeholder/200/300",
      type: "movie",
      year: "2024",
      rating: 8.5,
      isNew: true,
    },
    {
      id: "2",
      title: "Oppenheimer",
      poster: "/api/placeholder/200/300",
      type: "movie",
      year: "2023",
      rating: 8.3,
      isNew: false,
    },
    {
      id: "3",
      title: "Poor Things",
      poster: "/api/placeholder/200/300",
      type: "movie",
      year: "2023",
      rating: 7.9,
      isNew: true,
    },
    {
      id: "4",
      title: "Stranger Things",
      poster: "/api/placeholder/200/300",
      type: "series",
      year: "2016",
      rating: 8.7,
      hasNewEpisodes: true,
    },
    {
      id: "5",
      title: "The Crown",
      poster: "/api/placeholder/200/300",
      type: "series",
      year: "2016",
      rating: 8.6,
      hasNewEpisodes: false,
    },
    {
      id: "6",
      title: "Killers of the Flower Moon",
      poster: "/api/placeholder/200/300",
      type: "movie",
      year: "2023",
      rating: 7.6,
      isNew: false,
    },
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const clearRecentSearches = () => {
    // In real app, this would clear from localStorage or API
    console.log("Clearing recent searches");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
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