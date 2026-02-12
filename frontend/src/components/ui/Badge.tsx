'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { Industry, SkillLevel } from '@/lib/types';
import { getIndustryInfo, getSkillLevelInfo } from '@/lib/constants';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary-300 text-text-secondary',
        accent: 'bg-accent/10 text-accent-600',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        outline: 'border border-primary/20 text-primary',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

interface IndustryBadgeProps extends Omit<BadgeProps, 'variant'> {
  industry: Industry;
}

const IndustryBadge = forwardRef<HTMLSpanElement, IndustryBadgeProps>(
  ({ industry, className, size, ...props }, ref) => {
    const info = getIndustryInfo(industry);

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ size }),
          info.bgClass,
          className
        )}
        {...props}
      >
        {info.label}
      </span>
    );
  }
);

IndustryBadge.displayName = 'IndustryBadge';

interface SkillBadgeProps extends Omit<BadgeProps, 'variant'> {
  skillLevel: SkillLevel;
  showRange?: boolean;
}

const SkillBadge = forwardRef<HTMLSpanElement, SkillBadgeProps>(
  ({ skillLevel, showRange = false, className, size, ...props }, ref) => {
    const info = getSkillLevelInfo(skillLevel);

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ size }),
          info.bgClass,
          className
        )}
        {...props}
      >
        {info.label}
        {showRange && ` (${info.handicapRange})`}
      </span>
    );
  }
);

SkillBadge.displayName = 'SkillBadge';

export { Badge, IndustryBadge, SkillBadge, badgeVariants };
