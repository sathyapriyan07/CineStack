
"use client";
import { Play, Info, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface TitleCard {
  id: string;
  title: string;
  type: "movie" | "series";
  slug: string;
  poster_url: string | null;
  backdrop_url?: string | null;
  rating?: number;
  popularity?: number;
  release_date?: string;
  overview?: string;
  genres?: Array<{ name: string; slug: string }>;
}

interface AppleHeroBannerProps {
  title: TitleCard;
  className?: string;
}

export function AppleHeroBanner({ title, className }: AppleHeroBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className={`relative h-[72vh] min-h-105 flex items-end overflow-hidden rounded-b-2xl shadow-soft ${className}`}
    >
      {/* Parallax Background */}
      <div className="absolute inset-0 w-full h-full">
        {title.backdrop_url ? (
          <img
            src={title.backdrop_url}
            alt={title.title}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-700"
            style={{ filter: "brightness(0.82) blur(0.5px)" }}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-background to-background-dark" />
        )}
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
      </div>
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 pb-16 flex flex-col gap-8">
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "circOut" }}
          className="text-5xl md:text-7xl font-extralight text-white drop-shadow-lg tracking-tight leading-tight"
        >
          {title.title}
        </motion.h1>
        <div className="flex items-center gap-6 text-white/90 text-lg">
          {title.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{title.rating.toFixed(1)}</span>
            </span>
          )}
          {title.release_date && (
            <span>{new Date(title.release_date).getFullYear()}</span>
          )}
          <span className="rounded-xl px-3 py-1 bg-white/10 text-white/80 text-sm font-medium backdrop-blur-md">
            {title.type === "movie" ? "Movie" : "TV Series"}
          </span>
        </div>
        {title.genres && title.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {title.genres.slice(0, 3).map((genre) => (
              <span key={genre.slug} className="rounded-lg px-3 py-1 bg-white/10 text-white/70 text-sm font-light backdrop-blur-md">
                {genre.name}
              </span>
            ))}
          </div>
        )}
        {title.overview && (
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "circOut" }}
            className="text-xl text-white/80 max-w-2xl mb-2 drop-shadow-md"
          >
            {title.overview}
          </motion.p>
        )}
        <div className="flex gap-6 pt-2">
          <Link href={`/titles/${title.slug}`}>
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 0 2px #60aaff33, 0 4px 32px 0 rgba(0,0,0,0.45)" }}
              className="soft-shadow bg-white/10 text-white px-8 py-3 rounded-xl font-semibold text-lg flex items-center gap-3 backdrop-blur-md transition-all duration-200 focus-glow"
            >
              <Play className="h-6 w-6" />
              Play
            </motion.button>
          </Link>
          <Link href={`/titles/${title.slug}`}>
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 0 2px #fff2, 0 4px 32px 0 rgba(0,0,0,0.45)" }}
              className="soft-shadow bg-white/5 text-white/90 px-8 py-3 rounded-xl font-medium text-lg flex items-center gap-3 backdrop-blur-md border border-white/10 transition-all duration-200 focus-glow"
            >
              <Info className="h-6 w-6" />
              Details
            </motion.button>
          </Link>
        </div>
      </div>
      {/* Parallax fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </motion.section>
  );
}
