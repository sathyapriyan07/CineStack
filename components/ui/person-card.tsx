import Link from "next/link";
import { cn } from "@/lib/utils";

interface PersonCardProps {
  id: string;
  name: string;
  slug: string;
  profile_image_url: string | null;
  known_for_department?: string;
  popularity?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PersonCard({
  id,
  name,
  slug,
  profile_image_url,
  known_for_department,
  popularity,
  className,
  size = "md"
}: PersonCardProps) {
  const sizeClasses = {
    sm: "w-24",
    md: "w-32",
    lg: "w-40"
  };

  const imageSizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36"
  };

  return (
    <Link href={`/person/${slug}`} className={cn("group cursor-pointer", className)}>
      <div className={cn("flex-shrink-0 space-y-2", sizeClasses[size])}>
        {/* Profile Image */}
        <div className={cn(
          "relative rounded-full overflow-hidden bg-muted mx-auto transition-transform group-hover:scale-105",
          imageSizeClasses[size]
        )}>
          {profile_image_url ? (
            <img
              src={profile_image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name and Department */}
        <div className="text-center space-y-1">
          <h3 className={cn(
            "font-medium line-clamp-2 group-hover:text-primary transition-colors",
            size === "sm" ? "text-sm" : "text-base"
          )}>
            {name}
          </h3>

          {known_for_department && (
            <p className="text-xs text-muted-foreground">
              {known_for_department}
            </p>
          )}

          {popularity && size === "lg" && (
            <p className="text-xs text-muted-foreground">
              Popularity: {popularity.toFixed(1)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}