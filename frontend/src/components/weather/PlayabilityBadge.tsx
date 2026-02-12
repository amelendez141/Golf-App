'use client';

import { cn } from '@/lib/utils';

interface PlayabilityBadgeProps {
  score: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function PlayabilityBadge({
  score,
  className,
  size = 'md',
  showLabel = true,
}: PlayabilityBadgeProps) {
  const { color, bgColor, label } = getScoreInfo(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const scoreSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg',
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn('font-bold', color, scoreSizeClasses[size])}>{score}</span>
      {showLabel && <span className={cn('font-medium', color)}>{label}</span>}
    </div>
  );
}

function getScoreInfo(score: number): { color: string; bgColor: string; label: string } {
  if (score >= 9) {
    return {
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Perfect',
    };
  }
  if (score >= 7) {
    return {
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Great',
    };
  }
  if (score >= 5) {
    return {
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      label: 'Good',
    };
  }
  if (score >= 3) {
    return {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      label: 'Fair',
    };
  }
  return {
    color: 'text-error',
    bgColor: 'bg-error/10',
    label: 'Poor',
  };
}
