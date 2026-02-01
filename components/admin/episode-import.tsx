"use client";

import { useState } from "react";

export default function EpisodeImport() {
  const [seriesId, setSeriesId] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [episodeNumbers, setEpisodeNumbers] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);
  const [bulkResult, setBulkResult] = useState<{success:number,failed:number,errors:string[]} | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setBulkResult(null);
    try {
      if (bulkMode) {
        // Bulk import logic
        const numbers = episodeNumbers.split(",").map(n => n.trim()).filter(Boolean);
        const episodeNums = numbers.map(Number).filter(n => !isNaN(n));
        if (!episodeNums.length) throw new Error("Enter valid episode numbers");
        // Fetch all episodes from TMDB
        const tmdbRes = await fetch("/api/tmdb/episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesId, seasonNumber, episodeNumbers: episodeNums }),
        });
        const tmdbJson = await tmdbRes.json();
        if (!tmdbJson.episodes) throw new Error("Failed to fetch episodes from TMDB");
        // Import all episodes into Supabase
        const importRes = await fetch("/api/admin/import/bulk-episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesId: Number(seriesId), seasonNumber: Number(seasonNumber), episodes: tmdbJson.episodes }),
        });
        const importJson = await importRes.json();
        if (!importJson.success && !importJson.failed) throw new Error("Bulk import failed");
        setBulkResult(importJson);
      } else {
        // Single episode import logic
        const res = await fetch(`/api/tmdb/episode?seriesId=${seriesId}&seasonNumber=${seasonNumber}&episodeNumber=${episodeNumber}`);
        if (!res.ok) throw new Error("Failed to fetch episode from TMDB");
        const episodeData = await res.json();
        const importRes = await fetch("/api/admin/import/episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesId: Number(seriesId), seasonNumber: Number(seasonNumber), episodeNumber: Number(episodeNumber), episodeData }),
        });
        const importJson = await importRes.json();
        if (!importJson.success) throw new Error(importJson.error || "Import failed");
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleImport}>
      <h2 className="text-lg font-bold text-white">Import Episode from TMDB</h2>
      <div className="flex gap-2 items-center">
        <input type="text" className="bg-gray-800 text-white px-2 py-1 rounded" placeholder="Series ID" value={seriesId} onChange={e => setSeriesId(e.target.value)} required />
        <input type="number" className="bg-gray-800 text-white px-2 py-1 rounded" placeholder="Season #" value={seasonNumber} onChange={e => setSeasonNumber(e.target.value)} required />
        {!bulkMode && (
          <input type="number" className="bg-gray-800 text-white px-2 py-1 rounded" placeholder="Episode #" value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)} required />
        )}
        {bulkMode && (
          <input type="text" className="bg-gray-800 text-white px-2 py-1 rounded" placeholder="Episode #s (comma separated)" value={episodeNumbers} onChange={e => setEpisodeNumbers(e.target.value)} required />
        )}
        <label className="text-white text-xs ml-2">
          <input type="checkbox" checked={bulkMode} onChange={e => setBulkMode(e.target.checked)} className="mr-1" /> Bulk Import
        </label>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? (bulkMode ? "Importing Episodes..." : "Importing...") : (bulkMode ? "Bulk Import" : "Import Episode")}</button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && !bulkMode && <div className="text-green-500 mt-2">Episode imported successfully!</div>}
      {bulkResult && bulkMode && (
        <div className="mt-2 text-white">
          <div>Bulk import complete.</div>
          <div className="text-green-400">Success: {bulkResult.success}</div>
          <div className="text-red-400">Failed: {bulkResult.failed}</div>
          {bulkResult.errors.length > 0 && (
            <ul className="text-xs mt-2">
              {bulkResult.errors.map((err, i) => <li key={i} className="text-red-400">{err}</li>)}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
