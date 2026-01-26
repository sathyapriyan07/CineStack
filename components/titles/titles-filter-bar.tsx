"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TitlesFilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const year = params.get("year") ?? "";
  const language = params.get("language") ?? "";

  const submit = (formData: FormData) => {
    const next = new URLSearchParams(params.toString());
    next.set("q", String(formData.get("q") || ""));
    next.set("type", String(formData.get("type") || ""));
    next.set("year", String(formData.get("year") || ""));
    next.set("language", String(formData.get("language") || ""));
    next.delete("page");
    // prune empties
    ["q", "type", "year", "language"].forEach((k) => {
      if (!next.get(k)) next.delete(k);
    });
    router.push(`/titles?${next.toString()}`);
  };

  const reset = () => router.push("/titles");

  return (
    <form
      className="flex flex-wrap gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm"
      action={submit}
    >
      <div className="flex flex-1 min-w-[220px] items-center gap-2">
        <label className="w-16 text-xs text-white/60">Search</label>
        <Input name="q" defaultValue={q} placeholder="Title..." className="h-8" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/60">Type</label>
        <select
          name="type"
          defaultValue={type}
          className="h-8 rounded-md border border-white/15 bg-slate-950 px-2 text-xs text-white/90 outline-none focus:border-[--accent]"
        >
          <option value="">All</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/60">Year</label>
        <Input name="year" defaultValue={year} placeholder="2024" className="h-8 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/60">Language</label>
        <Input name="language" defaultValue={language} placeholder="en" className="h-8 w-20" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button type="submit" size="sm">
          Apply
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>
    </form>
  );
}

