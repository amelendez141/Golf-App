'use client';

import { TeeTimeCardSkeleton as BaseSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

// Re-export for backwards compatibility
export { BaseSkeleton as TeeTimeCardSkeleton };

export function TeeTimeCardSkeletonList({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <BaseSkeleton />
        </div>
      ))}
    </div>
  );
}
