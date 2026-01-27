import { Suspense } from "react";
import ImportTabs from "@/components/admin/import-tabs";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import from TMDB</h1>
        <p className="text-white/60 mt-1">
          Import movies, series, and people from The Movie Database (TMDB)
        </p>
      </div>

      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ImportTabs />
      </Suspense>
    </div>
  );
}