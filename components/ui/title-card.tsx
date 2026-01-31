import { Star, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TitleCardProps {
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

export function TitleCard({
  id,
  title,
  type,
  slug,
  poster_url,
  rating,
  popularity,
  release_date,
  overview,
  className,
  size = "md"
}: TitleCardProps) {
  const sizeClasses = {
    sm: "w-32",
    md: "w-48",
    lg: "w-64"
  };

  const aspectClasses = {
    sm: "aspect-[2/3]",
    md: "aspect-[2/3]",
    lg: "aspect-[2/3]"
  };

  return (
    <Link href={`/titles/${slug}`} className={cn("group cursor-pointer", className)}>
      <div className={cn("shrink-0 space-y-2", sizeClasses[size])}>
        {/* Poster */}
        <div className={cn(
          "relative rounded-lg overflow-hidden bg-muted transition-transform group-hover:scale-105",
          aspectClasses[size]
        )}>
          {poster_url ? (
            <img
              src={poster_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No Image
            </div>
          )}

          {/* Rating badge */}
          {rating && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </div>
          )}

          {/* Type indicator */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {type === "movie" ? "Movie" : "TV"}
            </Badge>
          </div>
        </div>

        {/* Title and Meta */}
        <div className="space-y-1">
          <h3 className={cn(
            "font-medium line-clamp-2 group-hover:text-primary transition-colors",
            size === "sm" ? "text-sm" : "text-base"
          )}>
            {title}
          </h3>

          <div className="flex items-center gap-2 text-muted-foreground">
            {release_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  {new Date(release_date).getFullYear()}
                </span>
              </div>
            )}
          </div>

          {/* Overview for larger cards */}
          {size === "lg" && overview && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {overview}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}