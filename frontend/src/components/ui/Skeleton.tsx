'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  /** Enable pulse animation in addition to shimmer */
  pulse?: boolean;
}

function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  pulse = false,
  style,
  ...props
}: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'shimmer relative overflow-hidden',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
        ...style,
      }}
      initial={{ opacity: 0.6 }}
      animate={pulse ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
      transition={pulse ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      {...props}
    >
      {/* Premium shimmer overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 0.5,
        }}
      />
    </motion.div>
  );
}

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          style={{
            width: i === lines - 1 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl bg-card p-4 shadow-card', className)}>
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonButton({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton className={cn(sizeClasses[size], 'rounded-lg', className)} />
  );
}

export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonButton };
