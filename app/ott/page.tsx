import { Suspense } from "react";
import HeroBanner from "@/components/ott/hero-banner";
import ContinueWatching from "@/components/ott/continue-watching";
import LatestReleases from "@/components/ott/latest-releases";
import BottomNavigation from "@/components/ott/bottom-navigation";
import { SkeletonLoader } from "@/components/ott/skeleton-loader";

export default function OTTPage() {
  return (
    <>
      {/* Hero Banner */}
      <Suspense fallback={<SkeletonLoader type="hero" />}>
        <HeroBanner />
      </Suspense>

      {/* Content Sections */}
      <div className="relative z-10 -mt-32 pb-20">
        <div className="space-y-8 px-4">
          {/* Continue Watching */}
          <Suspense fallback={<SkeletonLoader type="section" />}>
            <ContinueWatching />
          </Suspense>

          {/* Latest Releases */}
          <Suspense fallback={<SkeletonLoader type="section" />}>
            <LatestReleases />
          </Suspense>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}