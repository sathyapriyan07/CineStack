"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TitlesFilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type") ?? "";
  const year = params.get("year") ?? "";
  const language = params.get("language") ?? "";

  const submit = (formData: FormData) => {
    const next = new URLSearchParams(params.toString());
    next.set("type", String(formData.get("type") || ""));
    next.set("year", String(formData.get("year") || ""));
    next.set("language", String(formData.get("language") || ""));
    next.delete("page");
    // prune empties
    ["type", "year", "language"].forEach((k) => {
      if (!next.get(k)) next.delete(k);
    });
    router.push(`/titles?${next.toString()}`);
  };

  const reset = () => router.push("/titles");

  return (
    <form
      className="flex flex-wrap gap-4 rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-4 text-sm"
      action={submit}
    >
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/80 font-medium">Type</label>
        <select
          name="type"
          defaultValue={type}
          className="h-10 rounded-md border border-white/20 bg-black/50 px-3 text-sm text-white outline-none focus:border-blue-400"
        >
          <option value="">All</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/80 font-medium">Year</label>
        <Input name="year" defaultValue={year} placeholder="2024" className="h-10 w-24 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-400" />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/80 font-medium">Language</label>
        <Input name="language" defaultValue={language} placeholder="en" className="h-10 w-20 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-400" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          Apply
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={reset} className="text-white/80 hover:text-blue-400">
          Reset
        </Button>
      </div>
    </form>
  );
}

