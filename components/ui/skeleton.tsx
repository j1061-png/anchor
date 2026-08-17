export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/** Card-shaped placeholder used by route-level loading.tsx files. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-5 sm:p-6">
      <Skeleton className="h-5 w-1/3" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3.5"
            // Last line short, like real text.
          />
        ))}
      </div>
    </div>
  );
}
