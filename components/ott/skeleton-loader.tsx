interface SkeletonLoaderProps {
  type: "hero" | "section" | "card";
}

export function SkeletonLoader({ type }: SkeletonLoaderProps) {
  if (type === "hero") {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-gray-900">
        {/* Background skeleton */}
        <div className="absolute inset-0 bg-gray-800 animate-pulse transition-all" />

        {/* Content skeleton */}
        <div className="relative z-10 flex h-full items-end pb-32">
          <div className="w-full px-6 space-y-4">
            {/* Title skeleton */}
            <div className="h-12 w-3/4 bg-gray-700 rounded-xl animate-pulse soft-shadow transition-all" />
            <div className="h-6 w-1/2 bg-gray-700 rounded-xl animate-pulse soft-shadow transition-all" />

            {/* Metadata skeleton */}
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-gray-700 rounded-full animate-pulse soft-shadow transition-all" />
              <div className="h-4 w-12 bg-gray-700 rounded-full animate-pulse soft-shadow transition-all" />
              <div className="h-4 w-20 bg-gray-700 rounded-full animate-pulse soft-shadow transition-all" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-gray-700 rounded-full animate-pulse soft-shadow transition-all" />
              <div className="h-12 w-32 bg-gray-700 rounded-full animate-pulse soft-shadow transition-all" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "section") {
    return (
      <section className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-2">
          <div className="h-6 w-32 bg-gray-700 rounded-xl animate-pulse soft-shadow transition-all" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse soft-shadow transition-all" />
            <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse soft-shadow transition-all" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="flex gap-3 overflow-x-auto pb-1 px-2 snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[110px] h-[165px] bg-gray-700 rounded-xl animate-pulse soft-shadow transition-all snap-start"
            />
          ))}
        </div>
      </section>
    );
  }

  // Default card skeleton
  return (
    <div className="w-[110px] h-[165px] bg-gray-700 rounded-xl animate-pulse soft-shadow transition-all" />
  );
}