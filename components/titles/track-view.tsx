"use client";

import { useEffect } from "react";

export function TrackView({ titleId }: { titleId: string }) {
  useEffect(() => {
    // Track view on mount
    fetch(`/api/titles/${titleId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // Silently fail if tracking doesn't work
    });
  }, [titleId]);

  return null;
}
