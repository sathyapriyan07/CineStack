import { Star, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface GlassPosterCardProps {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
  rating?: number;
  popularity?: number;
  release_date?: string;
  overview?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GlassPosterCard({
  id,
  title,
  type,
  slug,
  poster_url,
  rating,
  release_date,
  overview,
  className,
  size = "md"
}: GlassPosterCardProps) {
  const sizeClasses = {
    sm: "w-32",
    md: "w-48",
    lg: "w-64"
  };
  const aspectClasses = {
    sm: "aspect-2/3",
    md: "aspect-2/3",
    lg: "aspect-2/3"
  };
  return (
    <Link href={`/titles/${slug}`} className={`group cursor-pointer ${className}`} tabIndex={0}>
      <motion.div
        whileHover={{ scale: 1.06, boxShadow: "0 0 0 2px #60aaff33, 0 4px 32px 0 rgba(0,0,0,0.45)" }}
        className={`soft-shadow glass ${sizeClasses[size]} ${aspectClasses[size]} flex flex-col rounded-2xl overflow-hidden transition-all duration-200`}
      >
        {/* Poster */}
        <div className="relative w-full h-full flex items-center justify-center bg-glass">
          {poster_url ? (
            <img
              src={poster_url}
              alt={title}
              className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 group-hover:opacity-95"
              loading="lazy"
              style={{ filter: "brightness(0.96)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 bg-white/5">
              No Image
            </div>
          )}
          {/* Reflection effect */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.12) 0%,rgba(0,0,0,0) 60%)" }} />
          {/* Rating badge */}
          {rating && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-soft">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </div>
          )}
          {/* Type indicator */}
          <div className="absolute top-2 left-2 bg-white/10 text-white/80 px-2 py-1 rounded text-xs font-medium backdrop-blur-md">
            {type === "movie" ? "Movie" : "TV"}
          </div>
        </div>
        {/* Title and Meta */}
        <div className="mt-3 space-y-1 text-center w-full px-2">
          <h3 className={`font-medium text-white/90 line-clamp-2 ${size === "sm" ? "text-sm" : "text-lg"} drop-shadow-sm`}>
            {title}
          </h3>
          {release_date && (
            <div className="flex items-center justify-center gap-1 text-white/60 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{new Date(release_date).getFullYear()}</span>
            </div>
          )}
          {/* Overview for larger cards */}
          {size === "lg" && overview && (
            <p className="text-sm text-white/60 line-clamp-2 mt-1">
              {overview}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
