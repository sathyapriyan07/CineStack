import * as React from "react";

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = "", rounded = "rounded-xl" }: SkeletonProps) {
  return (
    <div
      className={`skeleton bg-gradient-to-r from-[#181818] via-[#232323] to-[#181818] ${rounded} ${className}`}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

// Apple TV+ style shimmer for cards, hero, etc.
export function AppleSkeletonCard() {
  return <Skeleton className="w-44 h-64" />;
}

export function AppleSkeletonHero() {
  return (
    <div className="relative h-[72vh] min-h-[420px] w-full overflow-hidden rounded-b-2xl">
      <Skeleton className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex h-full items-end pb-24 px-8">
        <div className="space-y-6 w-full max-w-2xl">
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
