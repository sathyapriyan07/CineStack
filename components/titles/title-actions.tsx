"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PlatformLogo } from "@/components/ui/platform-logo";
import { Star } from "lucide-react";

type Trailer = { id: string; youtube_url: string; label: string | null };
type WatchLink = {
  id: string;
  platform: string;
  url: string;
  region: string | null;
  is_primary: boolean;
};
type MusicLink = { id: string; platform: string; url: string };

export default function TitleActions({
  titleId,
  trailers,
  watchLinks,
  musicLinks,
}: {
  titleId: string;
  trailers: Trailer[];
  watchLinks: WatchLink[];
  musicLinks: MusicLink[];
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [watchlisted, setWatchlisted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const mainTrailer = trailers[0] ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);
      if (!uid) return;

      const [{ data: wl }, { data: rt }] = await Promise.all([
        supabase.from("watchlist").select("id").eq("user_id", uid).eq("title_id", titleId).maybeSingle(),
        supabase.from("ratings").select("rating").eq("user_id", uid).eq("title_id", titleId).maybeSingle(),
      ]);
      if (cancelled) return;
      setWatchlisted(!!wl);
      setRating(rt?.rating ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, titleId]);

  const requireLogin = () => {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
  };

  const toggleWatchlist = async () => {
    if (!userId) return requireLogin();
    setSaving(true);
    try {
      if (watchlisted) {
        const { error } = await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", userId)
          .eq("title_id", titleId);
        if (error) throw error;
        setWatchlisted(false);
      } else {
        const { error } = await supabase.from("watchlist").insert({
          user_id: userId,
          title_id: titleId,
        });
        if (error) throw error;
        setWatchlisted(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const setUserRating = async (value: number) => {
    if (!userId) return requireLogin();
    setSaving(true);
    try {
      const { error } = await supabase.from("ratings").upsert(
        {
          user_id: userId,
          title_id: titleId,
          rating: value,
        },
        { onConflict: "user_id,title_id" }
      );
      if (error) throw error;
      setRating(value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {mainTrailer ? (
        <Button asChild size="lg" className="gap-2 bg-red-600 hover:bg-red-700">
          <a href={mainTrailer.youtube_url} target="_blank" rel="noreferrer">
            <PlatformLogo platform="youtube" />
            <span>Watch Trailer</span>
          </a>
        </Button>
      ) : null}

      {watchLinks.map((link) => (
        <Button
          key={link.id}
          asChild
          size="lg"
          variant="outline"
          className="gap-2 border-purple-500/40 text-purple-200 hover:bg-purple-900/20"
        >
          <a href={link.url} target="_blank" rel="noreferrer">
            <PlatformLogo platform={link.platform} />
            <span>
              Watch on {link.platform}
              {link.region ? ` (${link.region})` : ""}
            </span>
          </a>
        </Button>
      ))}

      {musicLinks.map((link) => (
        <Button
          key={link.id}
          asChild
          size="lg"
          variant="outline"
          className="gap-2 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/20"
        >
          <a href={link.url} target="_blank" rel="noreferrer">
            <PlatformLogo platform={link.platform} />
            <span>Listen on {link.platform}</span>
          </a>
        </Button>
      ))}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={watchlisted ? "default" : "outline"}
          onClick={toggleWatchlist}
          disabled={saving}
        >
          {watchlisted ? "In Watchlist" : "Add to Watchlist"}
        </Button>
        <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1">
          <Star className="h-4 w-4 text-yellow-300" />
          <select
            className="bg-transparent text-xs text-white/85 outline-none"
            value={rating ?? ""}
            onChange={(e) => setUserRating(Number(e.target.value))}
            disabled={saving}
          >
            <option value="">Rate</option>
            {Array.from({ length: 10 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

