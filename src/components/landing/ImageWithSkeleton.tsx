import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
}

export function ImageWithSkeleton({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  aspectRatio = "auto"
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    auto: ""
  };

  return (
    <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio])}>
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <Skeleton 
          className={cn(
            "absolute inset-0 w-full h-full",
            skeletonClassName
          )} 
        />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
      />
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Image non disponible</span>
        </div>
      )}
    </div>
  );
}

// Avatar with skeleton
interface AvatarWithSkeletonProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarWithSkeleton({
  src,
  alt,
  size = "md",
  className = ""
}: AvatarWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const initials = alt
    .split(" ")
    .map(word => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={cn("relative rounded-full overflow-hidden", sizeClasses[size], className)}>
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
      )}
      
      {/* Avatar image */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-an/20 flex items-center justify-center">
          <span className="text-an font-semibold text-xs">{initials}</span>
        </div>
      )}
    </div>
  );
}
