"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, CheckCircle, AlertCircle } from "lucide-react";

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

interface ImportItem extends TMDBResult {
  type: "movie" | "series";
  selected: boolean;
}

export default function TitleImport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ImportItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ImportItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/tmdb/search/multi?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const results: ImportItem[] = (data.results || [])
          .filter((item: TMDBResult) => item.media_type === "movie" || item.media_type === "tv")
          .map((item: TMDBResult) => ({
            ...item,
            type: item.media_type === "tv" ? "series" : "movie",
            selected: false,
          }));
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleItem = (item: ImportItem) => {
    const updated = searchResults.map(result =>
      result.id === item.id ? { ...result, selected: !result.selected } : result
    );
    setSearchResults(updated);

    if (!item.selected) {
      setSelectedItems([...selectedItems, { ...item, selected: true }]);
    } else {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    }
  };

  const removeSelected = (id: number) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
    setSearchResults(searchResults.map(result =>
      result.id === id ? { ...result, selected: false } : result
    ));
  };

  const handleBulkImport = async () => {
    if (selectedItems.length === 0) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const response = await fetch("/api/admin/import/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems }),
      });

      const result = await response.json();
      setImportResults(result);

      if (result.success > 0) {
        // Clear selected items and refresh search results
        setSelectedItems([]);
        setSearchResults([]);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResults({ success: 0, failed: selectedItems.length, errors: ["Network error occurred"] });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search TMDB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Search for movies or series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    item.selected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  onClick={() => toggleItem(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-24 rounded bg-gray-700 shrink-0 overflow-hidden">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {item.title || item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        {(item.release_date || item.first_air_date) && (
                          <span className="text-sm text-gray-400">
                            {(item.release_date || item.first_air_date)?.slice(0, 4)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {item.overview || "No description available"}
                      </p>
                    </div>
                  </div>
                  {item.selected && (
                    <div className="mt-3 flex justify-end">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Selected for Import ({selectedItems.length})
              <Button
                onClick={handleBulkImport}
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? "Importing..." : "Import Selected"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded bg-gray-700 shrink-0 overflow-hidden">
                      {item.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-white">{item.title || item.name}</span>
                      <span className="text-gray-400 ml-2">({item.type})</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelected(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              importResults.failed > 0 ? "text-red-400" : "text-green-400"
            }`}>
              {importResults.failed > 0 ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-white">
                Successfully imported: <span className="text-green-400 font-medium">{importResults.success}</span>
              </p>
              {importResults.failed > 0 && (
                <p className="text-white">
                  Failed: <span className="text-red-400 font-medium">{importResults.failed}</span>
                </p>
              )}
              {importResults.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-red-400 font-medium mb-2">Errors:</h4>
                  <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}