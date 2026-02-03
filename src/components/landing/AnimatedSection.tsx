import { useEffect, useRef, useState, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  skeleton?: ReactNode;
}

export function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  skeleton 
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Simulate loading delay for skeleton effect
          setTimeout(() => {
            setIsVisible(true);
            setTimeout(() => setHasLoaded(true), 100);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: "50px",
        threshold: 0.1
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {!isVisible && skeleton ? (
        <div className="animate-pulse">{skeleton}</div>
      ) : (
        <div 
          className={`transition-all duration-700 ease-out ${
            hasLoaded 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-8"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Skeleton presets for different section types
export function FeatureCardSkeleton() {
  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="bg-card border rounded-2xl p-6 space-y-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex items-center gap-3 pt-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export function BenefitCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 border space-y-4">
      <Skeleton className="h-14 w-14 rounded-xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function QuickLinkSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>
    </div>
  );
}
