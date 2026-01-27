"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface HorizontalCarouselProps {
  title: string;
  items: TitleCard[];
  className?: string;
}

export function HorizontalCarousel({ title, items, className }: HorizontalCarouselProps) {
  const scrollLeft = () => {
    const container = document.getElementById(`carousel-${title.replace(/\s+/g, '-').toLowerCase()}`);
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById(`carousel-${title.replace(/\s+/g, '-').toLowerCase()}`);
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const carouselId = `carousel-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        id={carouselId}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-48 group cursor-pointer"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
              {item.poster_url ? (
                <img
                  src={item.poster_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}

              {/* Rating badge */}
              {item.rating && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                  {item.rating.toFixed(1)}
                </div>
              )}

              {/* Type indicator */}
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                {item.type === "movie" ? "Movie" : "TV"}
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.release_date && (
                <p className="text-sm text-muted-foreground">
                  {new Date(item.release_date).getFullYear()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}