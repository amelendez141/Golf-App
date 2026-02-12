'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonAvatar } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface TeeTimeCardSkeletonProps {
  className?: string;
  /** Index for stagger animation delay */
  index?: number;
}

export function TeeTimeCardSkeleton({ className, index = 0 }: TeeTimeCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0, 0, 0.2, 1],
      }}
    >
      <Card variant="default" padding="none" className={cn('overflow-hidden', className)} noAnimation>
        {/* Image skeleton */}
        <Skeleton className="h-40 w-full rounded-none" />

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Host info skeleton */}
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Slot indicator skeleton */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>

          {/* Badge skeletons */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>
    </motion.div>
  );
}

export function TeeTimeCardSkeletonList({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <TeeTimeCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
