"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  type: "movie" | "series" | "person";
  poster_url?: string;
  profile_image_url?: string;
  slug?: string;
  release_date?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");

    if (result.type === "person" && result.slug) {
      router.push(`/person/${result.slug}`);
    } else if (result.slug) {
      router.push(`/titles/${result.slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/ott/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search movies, series, people..."
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-blue-400 transition-colors">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white/60 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 shrink-0">
                {result.poster_url || result.profile_image_url ? (
                  <img
                    src={result.poster_url || result.profile_image_url}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    {result.type === "person" ? "👤" : "🎬"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{result.title}</div>
                <div className="text-gray-400 text-sm">
                  {result.type === "person" ? "Person" : result.type.toUpperCase()}
                  {result.release_date && ` • ${result.release_date.slice(0, 4)}`}
                </div>
              </div>
            </div>
          ))}

          {/* View all results link */}
          <div className="p-3 border-t border-white/10">
            <Link
              href={`/ott/search?q=${encodeURIComponent(query)}`}
              className="block text-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
            >
              View all results →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}