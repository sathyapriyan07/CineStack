"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
// UI imports replaced with basic HTML elements

interface TitlesClientProps {
  initialSortBy: string;
  initialSortOrder: "asc" | "desc";
  initialType: "movie" | "series" | "all";
  initialGenre: string;
  availableGenres: Array<{ name: string; slug: string }>;
  titles: any[];
  totalPages: number;
  currentPage: number;
}

export default function TitlesClient({
  initialSortBy,
  initialSortOrder,
  initialType,
  initialGenre,
  availableGenres,
  titles,
  totalPages,
  currentPage,
}: TitlesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [type, setType] = useState<"movie" | "series" | "all">(initialType);
  const [genre, setGenre] = useState(initialGenre);

  const updateFilters = (updates: Partial<{
    sortBy: string;
    sortOrder: "asc" | "desc";
    type: "movie" | "series" | "all";
    genre: string;
  }>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (updates.sortBy !== undefined) {
      newParams.set("sortBy", updates.sortBy);
      setSortBy(updates.sortBy);
    }
    if (updates.sortOrder !== undefined) {
      newParams.set("sortOrder", updates.sortOrder);
      setSortOrder(updates.sortOrder);
    }
    if (updates.type !== undefined) {
      newParams.set("type", updates.type);
      setType(updates.type);
    }
    if (updates.genre !== undefined) {
      if (updates.genre) {
        newParams.set("genre", updates.genre);
      } else {
        newParams.delete("genre");
      }
      setGenre(updates.genre);
    }

    // Reset to page 1 when filters change
    newParams.set("page", "1");

    startTransition(() => {
      router.push(`/titles?${newParams.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", String(page));

    startTransition(() => {
      router.push(`/titles?${newParams.toString()}`);
    });
  };

  return (
    <>
      <FilterBar
        sortBy={sortBy}
        sortOrder={sortOrder}
        type={type}
        genre={genre}
        onSortByChange={(value: string) => updateFilters({ sortBy: value })}
        onSortOrderChange={(value: string) => updateFilters({ sortOrder: value })}
        onTypeChange={(value: string) => updateFilters({ type: value })}
        onGenreChange={(value: string) => updateFilters({ genre: value })}
        availableGenres={availableGenres}
        className="mb-8"
      />

      {isPending ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-white">Loading...</div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {titles.map((title) => (
              <TitleCard
                key={title.id}
                id={title.id}
                title={title.title}
                type={title.type}
                slug={title.slug}
                poster_url={title.poster_url}
                rating={title.rating}
                popularity={title.popularity}
                release_date={title.release_date}
              />
            ))}
          </div>

          {titles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No titles found matching your criteria.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-3">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const isCurrent = p === currentPage;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                      isCurrent
                        ? "bg-white text-black shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}