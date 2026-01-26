"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const titleSchema = z.object({
  type: z.enum(["movie", "series"]),
  title: z.string().min(1),
  original_title: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  release_date: z.string().optional().nullable(),
  runtime: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable()
  ),
  status: z.string().optional().nullable(),
  age_rating: z.string().optional().nullable(),
  languages: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  poster_url: z.string().url().optional().nullable().or(z.literal("")),
  backdrop_url: z.string().url().optional().nullable().or(z.literal("")),
  is_published: z.boolean().default(true),
  tmdb_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().nullable()
  ),
  admin_boost: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0).default(0)
  ),
});

type TitleFormValues = z.infer<typeof titleSchema>;

type Genre = { id: string; name: string; slug: string };

type LinkRow = { id: string; platform: string; url: string; region?: string | null; is_primary?: boolean };

type Person = { id: string; name: string; profile_image_url: string | null };

type Credit = {
  id: string;
  person_id: string;
  role: string;
  character_name: string | null;
  people: Person;
};

export default function TitleEditor({
  initialTitle,
  allGenres,
  initialGenreIds,
  allPeople,
}: {
  initialTitle: any | null;
  allGenres: Genre[];
  initialGenreIds: string[];
  allPeople: Person[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [genreIds, setGenreIds] = useState<Set<string>>(new Set(initialGenreIds));

  const [trailers, setTrailers] = useState<LinkRow[]>([]);
  const [watchLinks, setWatchLinks] = useState<LinkRow[]>([]);
  const [musicLinks, setMusicLinks] = useState<LinkRow[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);

  const [newTrailerUrl, setNewTrailerUrl] = useState("");
  const [newWatchPlatform, setNewWatchPlatform] = useState("");
  const [newWatchUrl, setNewWatchUrl] = useState("");
  const [newMusicPlatform, setNewMusicPlatform] = useState("");
  const [newMusicUrl, setNewMusicUrl] = useState("");
  const [newCreditPersonId, setNewCreditPersonId] = useState("");
  const [newCreditRole, setNewCreditRole] = useState("actor");
  const [newCreditCharacter, setNewCreditCharacter] = useState("");
  const [newCreditBillingOrder, setNewCreditBillingOrder] = useState("");
  const [newCreditDepartment, setNewCreditDepartment] = useState("");

  const form = useForm<TitleFormValues>({
    resolver: zodResolver(titleSchema) as any,
    defaultValues: {
      type: initialTitle?.type ?? "movie",
      title: initialTitle?.title ?? "",
      original_title: initialTitle?.original_title ?? "",
      overview: initialTitle?.overview ?? "",
      release_date: initialTitle?.release_date ?? "",
      runtime: initialTitle?.runtime ?? undefined,
      status: initialTitle?.status ?? "",
      age_rating: initialTitle?.age_rating ?? "",
      languages: initialTitle?.languages?.join(", ") ?? "",
      country: initialTitle?.country ?? "",
      poster_url: initialTitle?.poster_url ?? "",
      backdrop_url: initialTitle?.backdrop_url ?? "",
      is_published: initialTitle?.is_published ?? true,
      tmdb_id: initialTitle?.tmdb_id ?? null,
      admin_boost: initialTitle?.admin_boost ?? 0,
    },
  });

  const titleId = initialTitle?.id as string | undefined;

  useEffect(() => {
    if (!titleId) return;
    (async () => {
      const [{ data: t }, { data: w }, { data: m }, { data: c }] = await Promise.all([
        supabase.from("trailers").select("id, label, youtube_url").eq("title_id", titleId).order("created_at", { ascending: false }),
        supabase.from("watch_links").select("id, platform, url, region, is_primary").eq("title_id", titleId).order("is_primary", { ascending: false }),
        supabase.from("music_links").select("id, platform, url").eq("title_id", titleId).order("created_at", { ascending: false }),
        supabase
          .from("title_credits")
          .select("id, person_id, role, character_name, people(id, name, profile_image_url)")
          .eq("title_id", titleId)
          .order("role", { ascending: true }),
      ]);
      setTrailers((t ?? []).map((r: any) => ({ id: r.id, platform: r.label ?? "Trailer", url: r.youtube_url })));
      setWatchLinks((w ?? []).map((r: any) => ({ id: r.id, platform: r.platform, url: r.url, region: r.region, is_primary: r.is_primary })));
      setMusicLinks((m ?? []).map((r: any) => ({ id: r.id, platform: r.platform, url: r.url })));
      setCredits(
        (c ?? []).map((r: any) => ({
          id: r.id,
          person_id: r.person_id,
          role: r.role,
          character_name: r.character_name,
          billing_order: r.billing_order,
          department: r.department,
          people: Array.isArray(r.people) ? r.people[0] : r.people,
        }))
      );
    })();
  }, [supabase, titleId]);

  const toggleGenre = (id: string) => {
    setGenreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "poster_url" | "backdrop_url"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      const path = `${field}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const publicUrl = supabase.storage.from("media").getPublicUrl(data.path).data.publicUrl;
      form.setValue(field, publicUrl, { shouldDirty: true });
    } catch (e: any) {
      setError(e.message ?? "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const saveGenres = async (id: string) => {
    // Replace all mappings
    const desired = [...genreIds].map((gid) => ({ title_id: id, genre_id: gid }));
    await supabase.from("title_genres").delete().eq("title_id", id);
    if (desired.length) {
      const { error } = await supabase.from("title_genres").insert(desired);
      if (error) throw error;
    }
  };

  const onSubmit = async (values: TitleFormValues) => {
    setSaving(true);
    setError(null);
    try {
      // Get current user for created_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to create titles");
        setSaving(false);
        return;
      }

      const languages =
        values.languages?.split(",").map((l) => l.trim()).filter(Boolean) ?? [];
      const payload: any = {
        type: values.type,
        title: values.title,
        original_title: values.original_title || null,
        overview: values.overview || null,
        release_date: values.release_date || null,
        runtime: values.runtime || null,
        status: values.status || null,
        age_rating: values.age_rating || null,
        languages,
        country: values.country || null,
        poster_url: values.poster_url || null,
        backdrop_url: values.backdrop_url || null,
        is_published: values.is_published,
        tmdb_id: values.tmdb_id || null,
        updated_at: new Date().toISOString(),
      };

      if (!titleId) {
        payload.slug = toSlug(values.title);
        payload.created_by = user.id;
        const { data, error } = await supabase.from("titles").insert(payload).select("id").single();
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        await saveGenres(data.id);
        router.push(`/admin/titles/${data.id}`);
      } else {
        const { error } = await supabase.from("titles").update(payload).eq("id", titleId);
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        await saveGenres(titleId);
        router.refresh();
      }
    } catch (e: any) {
      console.error("Save error:", e);
      setError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const importFromTmdb = async () => {
    const q = form.getValues("title");
    const type = form.getValues("type");
    if (!q) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tmdb/search?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const first = data.results?.[0];
      if (!first) throw new Error("No TMDB results found");

      const detailsRes = await fetch(`/api/tmdb/details?type=${encodeURIComponent(type)}&id=${encodeURIComponent(first.id)}`);
      if (!detailsRes.ok) throw new Error(await detailsRes.text());
      const details = await detailsRes.json();

      const posterBase = "https://image.tmdb.org/t/p/w500";
      const backdropBase = "https://image.tmdb.org/t/p/w1280";

      form.setValue("title", details.title || details.name || q, { shouldDirty: true });
      form.setValue("original_title", details.original_title || details.original_name || "", { shouldDirty: true });
      form.setValue("overview", details.overview || "", { shouldDirty: true });
      form.setValue("release_date", details.release_date || details.first_air_date || "", { shouldDirty: true });
      form.setValue(
        "runtime",
        details.runtime || (details.episode_run_time && details.episode_run_time[0]) || undefined,
        { shouldDirty: true }
      );
      form.setValue("poster_url", details.poster_path ? `${posterBase}${details.poster_path}` : "", { shouldDirty: true });
      form.setValue(
        "backdrop_url",
        details.backdrop_path ? `${backdropBase}${details.backdrop_path}` : "",
        { shouldDirty: true }
      );
      form.setValue("tmdb_id", details.id, { shouldDirty: true });
    } catch (e: any) {
      setError(e.message ?? "TMDB import failed");
    } finally {
      setSaving(false);
    }
  };

  const addTrailer = async () => {
    if (!titleId) {
      setError("Save the title first, then add trailers/links.");
      return;
    }
    if (!newTrailerUrl.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("trailers")
        .insert({ title_id: titleId, youtube_url: newTrailerUrl.trim(), label: "Trailer" })
        .select("id, youtube_url")
        .single();
      if (error) throw error;
      setTrailers((prev) => [{ id: data.id, platform: "Trailer", url: data.youtube_url }, ...prev]);
      setNewTrailerUrl("");
    } catch (e: any) {
      setError(e.message ?? "Failed to add trailer");
    } finally {
      setSaving(false);
    }
  };

  const deleteTrailer = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from("trailers").delete().eq("id", id);
      if (error) throw error;
      setTrailers((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setSaving(false);
    }
  };

  const addWatchLink = async () => {
    if (!titleId) {
      setError("Save the title first, then add trailers/links.");
      return;
    }
    if (!newWatchPlatform.trim() || !newWatchUrl.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("watch_links")
        .insert({ title_id: titleId, platform: newWatchPlatform.trim(), url: newWatchUrl.trim(), is_primary: false })
        .select("id, platform, url, region, is_primary")
        .single();
      if (error) throw error;
      setWatchLinks((prev) => [...prev, data as any]);
      setNewWatchPlatform("");
      setNewWatchUrl("");
    } catch (e: any) {
      setError(e.message ?? "Failed to add watch link");
    } finally {
      setSaving(false);
    }
  };

  const deleteWatchLink = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from("watch_links").delete().eq("id", id);
      if (error) throw error;
      setWatchLinks((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setSaving(false);
    }
  };

  const addMusicLink = async () => {
    if (!titleId) {
      setError("Save the title first, then add trailers/links.");
      return;
    }
    if (!newMusicPlatform.trim() || !newMusicUrl.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("music_links")
        .insert({ title_id: titleId, platform: newMusicPlatform.trim(), url: newMusicUrl.trim() })
        .select("id, platform, url")
        .single();
      if (error) throw error;
      setMusicLinks((prev) => [...prev, data as any]);
      setNewMusicPlatform("");
      setNewMusicUrl("");
    } catch (e: any) {
      setError(e.message ?? "Failed to add music link");
    } finally {
      setSaving(false);
    }
  };

  const deleteMusicLink = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from("music_links").delete().eq("id", id);
      if (error) throw error;
      setMusicLinks((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setSaving(false);
    }
  };

  const addCredit = async () => {
    if (!titleId) {
      setError("Save the title first, then add credits.");
      return;
    }
    if (!newCreditPersonId.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        title_id: titleId,
        person_id: newCreditPersonId,
        role: newCreditRole,
        character_name: newCreditCharacter.trim() || null,
      };
      if (newCreditBillingOrder.trim()) {
        payload.billing_order = parseInt(newCreditBillingOrder.trim(), 10);
      }
      if (newCreditDepartment.trim()) {
        payload.department = newCreditDepartment.trim();
      }
      const { data, error } = await supabase
        .from("title_credits")
        .insert(payload)
        .select("id, person_id, role, character_name, billing_order, department, people(id, name, profile_image_url)")
        .single();
      if (error) throw error;
      setCredits((prev) => [
        ...prev,
        {
          id: data.id,
          person_id: data.person_id,
          role: data.role,
          character_name: data.character_name,
          billing_order: data.billing_order,
          department: data.department,
          people: Array.isArray(data.people) ? data.people[0] : data.people,
        },
      ]);
      setNewCreditPersonId("");
      setNewCreditRole("actor");
      setNewCreditCharacter("");
      setNewCreditBillingOrder("");
      setNewCreditDepartment("");
    } catch (e: any) {
      setError(e.message ?? "Failed to add credit");
    } finally {
      setSaving(false);
    }
  };

  const deleteCredit = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.from("title_credits").delete().eq("id", id);
      if (error) throw error;
      setCredits((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setSaving(false);
    }
  };

  const posterUrl = form.watch("poster_url");
  const backdropUrl = form.watch("backdrop_url");

  return (
    <div className="space-y-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-white/10 bg-black/20 p-5"
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[260px] space-y-3">
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="mb-1 block text-xs text-white/60">Type</label>
                <select
                  {...form.register("type")}
                  className="h-9 w-full rounded-md border border-white/15 bg-slate-950 px-2 text-sm text-white/90 outline-none focus:border-[--accent]"
                >
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="mb-1 block text-xs text-white/60">Published</label>
                <label className="flex h-9 items-center gap-2 rounded-md border border-white/15 bg-slate-950 px-2 text-sm text-white/90">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-500"
                    checked={!!form.watch("is_published")}
                    onChange={(e) => form.setValue("is_published", e.target.checked, { shouldDirty: true })}
                  />
                  <span>{form.watch("is_published") ? "Published" : "Draft"}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Title</label>
              <Input {...form.register("title")} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Original title</label>
              <Input {...form.register("original_title")} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Overview</label>
              <Textarea rows={4} {...form.register("overview")} />
            </div>
            <div className="flex gap-3">
              <div className="w-1/3">
                <label className="mb-1 block text-xs text-white/60">Release date</label>
                <Input type="date" {...form.register("release_date")} />
              </div>
              <div className="w-1/3">
                <label className="mb-1 block text-xs text-white/60">Runtime (min)</label>
                <Input type="number" {...form.register("runtime")} />
              </div>
              <div className="w-1/3">
                <label className="mb-1 block text-xs text-white/60">Age rating</label>
                <Input {...form.register("age_rating")} placeholder="PG-13, U/A..." />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="mb-1 block text-xs text-white/60">Languages (comma)</label>
                <Input {...form.register("languages")} placeholder="en, hi, ta..." />
              </div>
              <div className="w-1/2">
                <label className="mb-1 block text-xs text-white/60">Country</label>
                <Input {...form.register("country")} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Status</label>
              <Input {...form.register("status")} placeholder="Released, Ongoing..." />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Admin Boost (for trending)</label>
              <Input type="number" {...form.register("admin_boost")} placeholder="0" />
              <p className="mt-1 text-[11px] text-white/40">Higher boost = more visibility in trending</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={importFromTmdb} disabled={saving}>
                Import from TMDB
              </Button>
              <span className="text-[11px] text-white/50">
                Uses server-side `TMDB_API_KEY`
              </span>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <div>
              <label className="mb-1 block text-xs text-white/60">Poster URL</label>
              <Input {...form.register("poster_url")} />
              <label className="mt-1 inline-block text-[11px] text-white/50">
                Or upload:
                <input type="file" accept="image/*" className="ml-2 text-xs" onChange={(e) => uploadImage(e, "poster_url")} />
              </label>
              {posterUrl ? (
                <div className="mt-2 h-40 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={posterUrl} alt="Poster preview" className="h-full w-full object-cover" />
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Backdrop URL</label>
              <Input {...form.register("backdrop_url")} />
              <label className="mt-1 inline-block text-[11px] text-white/50">
                Or upload:
                <input type="file" accept="image/*" className="ml-2 text-xs" onChange={(e) => uploadImage(e, "backdrop_url")} />
              </label>
              {backdropUrl ? (
                <div className="mt-2 h-32 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={backdropUrl} alt="Backdrop preview" className="h-full w-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-white/85">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((g) => {
              const active = genreIds.has(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    active
                      ? "border-[--accent] bg-emerald-500/20 text-emerald-100"
                      : "border-white/15 bg-black/10 text-white/70 hover:bg-white/5"
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
            {!allGenres.length ? (
              <p className="text-xs text-white/50">Create genres first.</p>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-500/50 bg-red-500/10 p-3">
            <p className="text-xs font-medium text-red-300">Error saving title</p>
            <p className="mt-1 text-xs text-red-200">{error}</p>
            <p className="mt-2 text-[11px] text-red-200/70">
              Check browser console (F12) for details. Ensure you're logged in as an admin.
            </p>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="sm" 
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium min-w-[100px]"
          >
            {saving ? "Saving..." : titleId ? "Update" : "Create Title"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 className="mb-2 text-sm font-semibold text-white/85">Credits (Cast & Crew)</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={newCreditPersonId}
              onChange={(e) => setNewCreditPersonId(e.target.value)}
              className="h-8 flex-1 rounded-md border border-white/15 bg-slate-950 px-2 text-xs text-white/90 outline-none focus:border-[--accent]"
            >
              <option value="">Select person...</option>
              {allPeople.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={newCreditRole}
              onChange={(e) => setNewCreditRole(e.target.value)}
              className="h-8 w-32 rounded-md border border-white/15 bg-slate-950 px-2 text-xs text-white/90 outline-none focus:border-[--accent]"
            >
              <option value="actor">Actor</option>
              <option value="director">Director</option>
              <option value="writer">Writer</option>
              <option value="producer">Producer</option>
              <option value="composer">Composer</option>
              <option value="music_director">Music Director</option>
              <option value="cinematographer">Cinematographer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Input
              value={newCreditCharacter}
              onChange={(e) => setNewCreditCharacter(e.target.value)}
              placeholder="Character name (for actors)"
              className="h-8 flex-1 text-xs"
            />
            <Input
              type="number"
              value={newCreditBillingOrder}
              onChange={(e) => setNewCreditBillingOrder(e.target.value)}
              placeholder="Billing order (1=top)"
              className="h-8 w-24 text-xs"
            />
          </div>
          <Input
            value={newCreditDepartment}
            onChange={(e) => setNewCreditDepartment(e.target.value)}
            placeholder="Department (for crew)"
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={addCredit} disabled={saving || !newCreditPersonId}>
            Add Credit
          </Button>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          {credits.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-slate-950/50 p-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {c.people.profile_image_url ? (
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.people.profile_image_url} alt={c.people.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-8 w-8 flex-shrink-0 rounded-md border border-white/10 bg-slate-900 flex items-center justify-center text-[10px] text-white/40">
                    {c.people.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-white/90 font-medium">{c.people.name}</div>
                  <div className="text-white/60">
                    {c.role}
                    {c.character_name ? ` • ${c.character_name}` : ""}
                    {c.billing_order !== null ? ` • #${c.billing_order}` : ""}
                    {c.department ? ` • ${c.department}` : ""}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="destructive" onClick={() => deleteCredit(c.id)} disabled={saving}>
                Delete
              </Button>
            </div>
          ))}
          {!credits.length ? <p className="text-white/50">No credits yet</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white/85">Trailers</h3>
          <div className="flex gap-2">
            <Input
              value={newTrailerUrl}
              onChange={(e) => setNewTrailerUrl(e.target.value)}
              placeholder="YouTube URL"
            />
            <Button size="sm" onClick={addTrailer} disabled={saving}>
              Add
            </Button>
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            {trailers.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2">
                <a href={t.url} target="_blank" rel="noreferrer" className="truncate text-white/70 hover:text-white/90">
                  {t.url}
                </a>
                <Button size="sm" variant="destructive" onClick={() => deleteTrailer(t.id)} disabled={saving}>
                  Delete
                </Button>
              </li>
            ))}
            {!trailers.length ? <li className="text-white/50">None</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white/85">Watch links</h3>
          <div className="space-y-2">
            <Input value={newWatchPlatform} onChange={(e) => setNewWatchPlatform(e.target.value)} placeholder="Platform (Netflix)" />
            <div className="flex gap-2">
              <Input value={newWatchUrl} onChange={(e) => setNewWatchUrl(e.target.value)} placeholder="URL" />
              <Button size="sm" onClick={addWatchLink} disabled={saving}>
                Add
              </Button>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            {watchLinks.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-white/80">{w.platform}</div>
                  <a href={w.url} target="_blank" rel="noreferrer" className="truncate text-white/60 hover:text-white/85">
                    {w.url}
                  </a>
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteWatchLink(w.id)} disabled={saving}>
                  Delete
                </Button>
              </li>
            ))}
            {!watchLinks.length ? <li className="text-white/50">None</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white/85">Music links</h3>
          <div className="space-y-2">
            <Input value={newMusicPlatform} onChange={(e) => setNewMusicPlatform(e.target.value)} placeholder="Platform (Spotify)" />
            <div className="flex gap-2">
              <Input value={newMusicUrl} onChange={(e) => setNewMusicUrl(e.target.value)} placeholder="URL" />
              <Button size="sm" onClick={addMusicLink} disabled={saving}>
                Add
              </Button>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            {musicLinks.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-white/80">{m.platform}</div>
                  <a href={m.url} target="_blank" rel="noreferrer" className="truncate text-white/60 hover:text-white/85">
                    {m.url}
                  </a>
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteMusicLink(m.id)} disabled={saving}>
                  Delete
                </Button>
              </li>
            ))}
            {!musicLinks.length ? <li className="text-white/50">None</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );
}

