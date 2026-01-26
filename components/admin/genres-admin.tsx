"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toSlug } from "@/lib/utils";

type Genre = { id: string; name: string; slug: string };

export default function GenresAdmin({ initialGenres }: { initialGenres: Genre[] }) {
  const supabase = createSupabaseBrowserClient();
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGenre = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = { name: name.trim(), slug: toSlug(name) };
      const { data, error } = await supabase
        .from("genres")
        .insert(payload)
        .select("id, name, slug")
        .single();
      if (error) throw error;
      setGenres((prev) => [...prev, data]);
      setName("");
    } catch (e: any) {
      setError(e.message ?? "Failed to add genre");
    } finally {
      setSaving(false);
    }
  };

  const deleteGenre = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from("genres").delete().eq("id", id);
      if (error) throw error;
      setGenres((prev) => prev.filter((g) => g.id !== id));
    } catch (e: any) {
      setError(e.message ?? "Failed to delete genre");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white/90">Add New Genre</h3>
        <div className="flex max-w-sm gap-2">
          <Input
            placeholder="Enter genre name (e.g., Action, Drama)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                addGenre();
              }
            }}
            className="flex-1"
          />
          <Button size="sm" onClick={addGenre} disabled={saving || !name.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {saving ? "Adding..." : "+ Add"}
          </Button>
        </div>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-black/30 text-white/60">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((g) => (
              <tr key={g.id} className="border-b border-white/5 odd:bg-white/[0.02]">
                <td className="px-3 py-2 text-sm text-white/90">{g.name}</td>
                <td className="px-3 py-2 text-white/60">{g.slug}</td>
                <td className="px-3 py-2 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteGenre(g.id)}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {!genres.length ? (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-xs text-white/50">
                  No genres yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

