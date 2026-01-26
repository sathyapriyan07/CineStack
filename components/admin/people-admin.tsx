"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Edit } from "lucide-react";
import { toSlug } from "@/lib/utils";

type Person = { id: string; name: string; profile_image_url: string | null; bio: string | null; slug: string | null };

export default function PeopleAdmin({ initialPeople }: { initialPeople: Person[] }) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [name, setName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  const addPerson = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = { 
        name: name.trim(),
        slug: slug.trim() || toSlug(name.trim())
      };
      if (profileImageUrl.trim()) {
        payload.profile_image_url = profileImageUrl.trim();
      }
      if (bio.trim()) {
        payload.bio = bio.trim();
      }
      const { data, error } = await supabase
        .from("people")
        .insert(payload)
        .select("id, name, profile_image_url, bio, slug")
        .single();
      if (error) throw error;
      setPeople((prev) => [...prev, data]);
      setName("");
      setProfileImageUrl("");
      setBio("");
      setSlug("");
      setShowAddForm(false);
    } catch (e: any) {
      setError(e.message ?? "Failed to add person");
    } finally {
      setSaving(false);
    }
  };

  const updatePerson = async (id: string) => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = { 
        name: name.trim(),
        slug: slug.trim() || toSlug(name.trim())
      };
      if (profileImageUrl.trim()) {
        payload.profile_image_url = profileImageUrl.trim();
      } else {
        payload.profile_image_url = null;
      }
      if (bio.trim()) {
        payload.bio = bio.trim();
      } else {
        payload.bio = null;
      }
      const { data, error } = await supabase
        .from("people")
        .update(payload)
        .eq("id", id)
        .select("id, name, profile_image_url, bio, slug")
        .single();
      if (error) throw error;
      setPeople((prev) => prev.map((p) => (p.id === id ? data : p)));
      setEditingId(null);
      setName("");
      setProfileImageUrl("");
      setBio("");
      setSlug("");
    } catch (e: any) {
      setError(e.message ?? "Failed to update person");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (person: Person) => {
    setEditingId(person.id);
    setName(person.name);
    setProfileImageUrl(person.profile_image_url || "");
    setBio(person.bio || "");
    setSlug(person.slug || "");
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setProfileImageUrl("");
    setBio("");
    setSlug("");
  };

  const deletePerson = async (id: string) => {
    if (!confirm("Delete this person? This will also remove all their credits from titles.")) return;
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from("people").delete().eq("id", id);
      if (error) throw error;
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e.message ?? "Failed to delete person");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `people/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("media")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      setError(error.message);
      return;
    }
    const publicUrl = supabase.storage.from("media").getPublicUrl(data.path).data.publicUrl;
    setProfileImageUrl(publicUrl);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90">Manage People</h3>
        <Button 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Plus className="mr-1 h-3 w-3" />
          {showAddForm ? "Cancel" : "Add Person"}
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{editingId ? "Edit Person" : "New Person"}</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (editingId) cancelEdit();
                else {
                  setShowAddForm(false);
                  setName("");
                  setProfileImageUrl("");
                  setBio("");
                  setSlug("");
                }
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-white/60">Name *</label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId && !slug.trim()) {
                    setSlug(toSlug(e.target.value));
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Slug</label>
              <Input
                placeholder="john-doe"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-white/40">Auto-generated from name if empty</p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Bio</label>
              <Textarea
                rows={4}
                placeholder="Biography..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Profile Image URL</label>
              <Input
                placeholder="https://..."
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
              />
              <label className="mt-1 inline-block text-[11px] text-white/40">
                Or upload:
                <input
                  type="file"
                  accept="image/*"
                  className="ml-2 text-xs"
                  onChange={uploadImage}
                />
              </label>
              {profileImageUrl && (
                <div className="mt-2 h-20 w-20 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profileImageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={() => editingId ? updatePerson(editingId) : addPerson()} 
              disabled={saving || !name.trim()}
            >
              {saving ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update Person" : "Add Person")}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-white/60">
            <tr>
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr
                key={p.id}
                className="border-b border-white/5 odd:bg-white/2.5"
              >
                <td className="px-3 py-2">
                  {p.profile_image_url ? (
                    <div className="h-12 w-12 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.profile_image_url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-md border border-white/10 bg-slate-900 flex items-center justify-center text-[10px] text-white/40">
                      No image
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="text-sm text-white/90">{p.name}</div>
                  {p.slug && (
                    <div className="text-xs text-white/50">/{p.slug}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(p)}
                      disabled={saving}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePerson(p.id)}
                      disabled={saving}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!people.length && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-4 text-center text-xs text-white/40"
                >
                  No people yet. Click &quot;Add Person&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
