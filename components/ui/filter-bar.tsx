import { useState } from "react";
import { Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  type?: "movie" | "series" | "all";
  genre?: string;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  onTypeChange?: (value: "movie" | "series" | "all") => void;
  onGenreChange?: (value: string) => void;
  availableGenres?: Array<{ name: string; slug: string }>;
  className?: string;
}

export function FilterBar({
  sortBy,
  sortOrder,
  type = "all",
  genre,
  onSortByChange,
  onSortOrderChange,
  onTypeChange,
  onGenreChange,
  availableGenres = [],
  className
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "rating", label: "Rating" },
    { value: "release_date", label: "Release Date" },
    { value: "title", label: "Title" },
    { value: "vote_count", label: "Vote Count" },
  ];

  const typeOptions = [
    { value: "all", label: "All" },
    { value: "movie", label: "Movies" },
    { value: "series", label: "TV Series" },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
          className="gap-2"
        >
          {sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </Button>

        {/* Toggle Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 flex-wrap p-4 bg-muted/50 rounded-lg">
          {/* Type Filter */}
          {onTypeChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <Select value={type} onValueChange={onTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Genre Filter */}
          {onGenreChange && availableGenres.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Genre:</span>
              <Select value={genre || "all"} onValueChange={(value) => onGenreChange(value === "all" ? "" : value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {availableGenres.map((g) => (
                    <SelectItem key={g.slug} value={g.slug}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {(type !== "all" || genre) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {type !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type: {typeOptions.find(t => t.value === type)?.label}
            </Badge>
          )}

          {genre && (
            <Badge variant="secondary" className="gap-1">
              Genre: {availableGenres.find(g => g.slug === genre)?.name}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}