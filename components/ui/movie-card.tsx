import Image from "next/image";

export default function MovieCard({ poster, title }) {
  return (
    <div className="w-[120px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-black/80 transition-all duration-200 hover:scale-105 cursor-pointer">
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover object-center rounded-xl"
            loading="lazy"
            style={{ filter: "brightness(0.96)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 bg-white/5 rounded-xl text-xs">No Image</div>
        )}
      </div>
    </div>
  );
}
