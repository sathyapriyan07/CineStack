"use client";

import { useState } from "react";
// UI imports replaced with basic HTML elements
import { Search, Plus, X, CheckCircle, AlertCircle } from "lucide-react";

interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  birthday?: string;
  biography?: string;
}

interface ImportPerson extends TMDBPerson {
  selected: boolean;
}

export default function PeopleImport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ImportPerson[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<ImportPerson[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/tmdb/search/person?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const results: ImportPerson[] = (data.results || []).map((person: TMDBPerson) => ({
          ...person,
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

  const togglePerson = (person: ImportPerson) => {
    const updated = searchResults.map(result =>
      result.id === person.id ? { ...result, selected: !result.selected } : result
    );
    setSearchResults(updated);

    if (!person.selected) {
      setSelectedPeople([...selectedPeople, { ...person, selected: true }]);
    } else {
      setSelectedPeople(selectedPeople.filter(selected => selected.id !== person.id));
    }
  };

  const removeSelected = (id: number) => {
    setSelectedPeople(selectedPeople.filter(person => person.id !== id));
    setSearchResults(searchResults.map(result =>
      result.id === id ? { ...result, selected: false } : result
    ));
  };

  const handleBulkImport = async () => {
    if (selectedPeople.length === 0) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const response = await fetch("/api/admin/import/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: selectedPeople }),
      });

      const result = await response.json();
      setImportResults(result);

      if (result.success > 0) {
        // Clear selected people and refresh search results
        setSelectedPeople([]);
        setSearchResults([]);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResults({ success: 0, failed: selectedPeople.length, errors: ["Network error occurred"] });
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
            Search TMDB People
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="rounded-xl shadow-lg bg-gray-900 p-4 mb-4">
              <div className="mb-2 flex items-center gap-2 font-bold text-lg">People Import</div>
              <div>
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
                  className="mb-2 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 w-full"
                />
                <button onClick={handleSearch} disabled={isSearching} className="px-4 py-2 rounded bg-blue-600 text-white">Search</button>
              </div>
            </div>
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((person) => (
                <div
                  key={person.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    person.selected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  onClick={() => togglePerson(person)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-700 shrink-0 overflow-hidden">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                          👤
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {person.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {person.known_for_department}
                        </Badge>
                        {person.birthday && (
                          <span className="text-sm text-gray-400">
                            {new Date(person.birthday).getFullYear()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-2">
                        Popularity: {person.popularity.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  {person.selected && (
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

      {/* Selected People */}
      {selectedPeople.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Selected for Import ({selectedPeople.length})
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
              {selectedPeople.map((person) => (
                <div key={person.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 shrink-0 overflow-hidden">
                      {person.profile_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-white">{person.name}</span>
                      <span className="text-gray-400 ml-2">({person.known_for_department})</span>
                      {person.birthday && (
                        <span className="text-gray-400 ml-2">
                          Born: {new Date(person.birthday).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelected(person.id)}
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