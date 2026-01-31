import HeroBanner from "@/components/ott/hero-banner";
import ContinueWatching from "@/components/ott/continue-watching";
import LatestReleases from "@/components/ott/latest-releases";
import BottomNavigation from "@/components/ott/bottom-navigation";

export default function OTTPage() {
  return (
    <>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Content Sections */}
      <div className="relative z-10 -mt-32 pb-20">
        <div className="space-y-8 px-4">
          {/* Continue Watching */}
          <ContinueWatching />

          {/* Latest Releases */}
          <LatestReleases />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}
