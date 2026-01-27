"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_url: string;
  backdrop_url: string;
  release_date: string;
  genres: { name: string }[];
  vote_average: number;
}

// Mock featured movies data
const featuredMovies: Movie[] = [
  {
    id: "1",
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_url: "/placeholder-poster.jpg",
    backdrop_url: "/placeholder-backdrop.jpg",
    release_date: "2010",
    genres: [{ name: "Action" }, { name: "Sci-Fi" }],
    vote_average: 8.8,
  },
  {
    id: "2",
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    poster_url: "/placeholder-poster.jpg",
    backdrop_url: "/placeholder-backdrop.jpg",
    release_date: "2008",
    genres: [{ name: "Action" }, { name: "Crime" }],
    vote_average: 9.0,
  },
];

export default function HeroBanner() {
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(featuredMovies[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleWatchNow = () => {
    // Handle watch now action
    console.log("Watch now:", currentMovie?.title);
  };

  const handleAddToList = () => {
    // Handle add to list action
    console.log("Add to list:", currentMovie?.title);
  };

  if (!currentMovie) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdrop_url}
          alt={currentMovie.title}
          className="h-full w-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end pb-32">
        <div className="w-full px-6">
          {/* Movie Title */}
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {currentMovie.title}
          </h1>

          {/* Metadata Row */}
          <div className="mb-6 flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span>{currentMovie.vote_average}</span>
            </div>
            <span>•</span>
            <span>{currentMovie.release_date}</span>
            <span>•</span>
            <div className="flex gap-2">
              {currentMovie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.name}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleWatchNow}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <Play className="h-5 w-5 fill-current" />
              Watch Now
            </Button>

            <Button
              onClick={handleAddToList}
              variant="outline"
              className="flex items-center gap-2 rounded-full border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
            >
              <Plus className="h-5 w-5" />
              Add to List
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setCurrentMovie(featuredMovies[index]);
            }}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}