"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toSlug } from "@/lib/utils";

type TitleLite = { id: string; title: string; type: string; is_published: boolean; poster_url?: string | null; slug?: string };

type Item = {
  id: string; // home_section_items.id
  rank: number;
  title_id: string;
  title: any;
};

type Section = {
  id: string;
  key: string;
  title: string;
  sort_order: number;
  items: Item[];
};

export default function HomeSectionsAdmin({
  initialSections,
  allTitles,
}: {
  initialSections: Section[];
  allTitles: TitleLite[];
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newKey, setNewKey] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const [search, setSearch] = useState("");
  const [selectedTitleId, setSelectedTitleId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSections[0]?.id ?? ""
  );

  const filteredTitles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allTitles.slice(0, 20);
    return allTitles
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 20);
  }, [allTitles, search]);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;

    const sectionId = source.droppableId;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const items = Array.from(section.items);
    const [moved] = items.splice(source.index, 1);
    items.splice(destination.index, 0, moved);

    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items } : s))
    );
  };

  const saveOrder = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const section of sections) {
        for (let idx = 0; idx < section.items.length; idx++) {
          const item = section.items[idx];
          const newRank = idx;
          if (item.rank !== newRank) {
            const { error } = await supabase
              .from("home_section_items")
              .update({ rank: newRank })
              .eq("id", item.id);
            if (error) throw error;
            item.rank = newRank;
          }
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  const createSection = async () => {
    if (!newKey.trim() || !newTitle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("home_sections")
        .insert({
          key: toSlug(newKey),
          title: newTitle.trim(),
          sort_order: sections.length,
        })
        .select("id, key, title, sort_order")
        .single();
      if (error) throw error;
      setSections((prev) => [...prev, { ...data, items: [] } as any]);
      setSelectedSectionId(data.id);
      setNewKey("");
      setNewTitle("");
    } catch (e: any) {
      setError(e.message ?? "Failed to create section");
    } finally {
      setSaving(false);
    }
  };

  const addTitleToSection = async () => {
    if (!selectedSectionId || !selectedTitleId) return;
    setSaving(true);
    setError(null);
    try {
      const section = sections.find((s) => s.id === selectedSectionId);
      if (!section) throw new Error("Section not found");
      if (section.items.some((i) => i.title_id === selectedTitleId)) {
        throw new Error("Title already in section");
      }
      const rank = section.items.length;
      const { data, error } = await supabase
        .from("home_section_items")
        .insert({ section_id: selectedSectionId, title_id: selectedTitleId, rank })
        .select("id, rank, title_id")
        .single();
      if (error) throw error;

      const title = allTitles.find((t) => t.id === selectedTitleId);
      setSections((prev) =>
        prev.map((s) =>
          s.id === selectedSectionId
            ? {
                ...s,
                items: [
                  ...s.items,
                  { id: data.id, rank: data.rank, title_id: data.title_id, title },
                ] as any,
              }
            : s
        )
      );
      setSelectedTitleId("");
    } catch (e: any) {
      setError(e.message ?? "Failed to add title");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (sectionId: string, itemId: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from("home_section_items").delete().eq("id", itemId);
      if (error) throw error;
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
        )
      );
    } catch (e: any) {
      setError(e.message ?? "Failed to remove item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-white/60">
        Drag and drop items inside a section to reorder, then click “Save order”.
        Adding/removing items publishes instantly (and public home updates via realtime).
      </p>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h2 className="mb-3 text-sm font-semibold text-white/85">Create section</h2>
        <div className="flex flex-wrap gap-2">
          <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Key (top-movies)" />
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title (Top Movies)" />
          <Button size="sm" onClick={createSection} disabled={saving}>
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h2 className="mb-3 text-sm font-semibold text-white/85">Add title to section</h2>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-md border border-white/15 bg-slate-950 px-2 text-sm text-white/90"
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            <option value="">Select section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.key})
              </option>
            ))}
          </select>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles..." />
          <select
            className="h-9 min-w-[220px] rounded-md border border-white/15 bg-slate-950 px-2 text-sm text-white/90"
            value={selectedTitleId}
            onChange={(e) => setSelectedTitleId(e.target.value)}
          >
            <option value="">Select title</option>
            {filteredTitles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.type})
              </option>
            ))}
          </select>
          <Button size="sm" onClick={addTitleToSection} disabled={saving}>
            Add
          </Button>
        </div>
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/85">
                  {section.title} <span className="text-white/50">({section.key})</span>
                </h2>
              </div>
              <Droppable droppableId={section.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {section.items.map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(p) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"
                          >
                            <span className="w-8 text-white/40">#{idx + 1}</span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-white/90">{item.title?.title ?? item.title_id}</div>
                              <div className="text-[11px] text-white/50">
                                {item.title?.type?.toUpperCase?.() ?? ""}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeItem(section.id, item.id)}
                              disabled={saving}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {!section.items.length ? (
                      <p className="text-xs text-white/50">No titles assigned yet.</p>
                    ) : null}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <div className="flex justify-end">
        <Button size="sm" onClick={saveOrder} disabled={saving}>
          {saving ? "Saving..." : "Save order"}
        </Button>
      </div>
    </div>
  );
}

