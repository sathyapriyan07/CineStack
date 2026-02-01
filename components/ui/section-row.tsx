import { ChevronRight } from "lucide-react";
import MovieCard from "./movie-card";

export default function SectionRow({ title, items }) {
  return (
    <section className="mb-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button className="text-white/80 hover:text-white transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 px-2 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {items.map((item, idx) => (
          <div key={idx} className="snap-start">
            <MovieCard poster={item.poster} title={item.title} />
          </div>
        ))}
      </div>
    </section>
  );
}
