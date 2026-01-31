
"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface TitleCard {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
  rating?: number;
  popularity?: number;
  release_date?: string;
}

interface ContentRailProps {
  title: string;
  items: TitleCard[];
  className?: string;
}

export function ContentRail({ title, items, className }: ContentRailProps) {
  const carouselId = `carousel-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const scroll = (dir: "left" | "right") => {
    const container = document.getElementById(carouselId);
    if (container) {
      container.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    }
  };
  return (
    <section className={`space-y-4 cinematic-spacing ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light text-white tracking-tight drop-shadow-md">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="rounded-xl bg-white/10 hover:bg-white/20 p-2 transition-all shadow-soft focus-glow"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="rounded-xl bg-white/10 hover:bg-white/20 p-2 transition-all shadow-soft focus-glow"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
      <motion.div
        id={carouselId}
        className="flex gap-7 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/titles/${item.slug}`}
            className="snap-start"
            tabIndex={0}
          >
            <motion.div
              whileHover={{ scale: 1.06, boxShadow: "0 0 0 2px #60aaff33, 0 4px 32px 0 rgba(0,0,0,0.45)" }}
              className="GlassPosterCard group w-44 md:w-52 flex flex-col items-center cursor-pointer rounded-2xl overflow-hidden soft-shadow bg-glass backdrop-blur-lg transition-all duration-200"
            >
              <div className="relative aspect-2/3 w-full flex items-center justify-center">
                {item.poster_url ? (
                  <img
                    src={item.poster_url}
                    alt={item.title}
                    className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105 group-hover:opacity-95"
                    loading="lazy"
                    style={{ filter: "brightness(0.96)" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 bg-white/5">
                    No Image
                  </div>
                )}
                {/* Rating badge */}
                {item.rating && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium shadow-soft">
                    {item.rating.toFixed(1)}
                  </div>
                )}
                {/* Type indicator */}
                <div className="absolute top-2 left-2 bg-white/10 text-white/80 px-2 py-1 rounded text-xs font-medium backdrop-blur-md">
                  {item.type === "movie" ? "Movie" : "TV"}
                </div>
              </div>
              <div className="mt-3 space-y-1 text-center w-full px-2">
                <h3 className="font-medium text-white/90 line-clamp-2 text-lg drop-shadow-sm">
                  {item.title}
                </h3>
                {item.release_date && (
                  <p className="text-sm text-white/60">
                    {new Date(item.release_date).getFullYear()}
                  </p>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}
