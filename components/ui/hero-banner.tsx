import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface HeroBannerProps {
  title: TitleCard;
  className?: string;
}

export function HeroBanner({ title, className }: HeroBannerProps) {
  return (
    <div className={`relative h-[70vh] overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        {title.backdrop_url ? (
          <img
            src={title.backdrop_url}
            alt={title.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-slate-900 to-slate-700" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-4">
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              {title.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center gap-4 text-white/90">
              {title.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{title.rating.toFixed(1)}</span>
                </div>
              )}

              {title.release_date && (
                <span>{new Date(title.release_date).getFullYear()}</span>
              )}

              <Badge variant="secondary" className="text-white border-white/20">
                {title.type === "movie" ? "Movie" : "TV Series"}
              </Badge>
            </div>

            {/* Genres */}
            {title.genres && title.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {title.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre.slug} variant="outline" className="text-white border-white/30">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Overview */}
            {title.overview && (
              <p className="text-lg text-white/80 line-clamp-3 max-w-xl">
                {title.overview}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Watch Now
              </Button>

              <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 hover:bg-white/10" asChild>
                <Link href={`/titles/${title.slug}`}>
                  <Info className="h-5 w-5" />
                  More Info
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fade effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}