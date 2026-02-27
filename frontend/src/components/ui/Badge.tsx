'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { Industry, SkillLevel } from '@/lib/types';
import { getIndustryInfo, getSkillLevelInfo } from '@/lib/constants';

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        secondary: 'bg-gray-50 text-gray-600 border border-gray-200',
        accent: 'bg-accent/10 text-accent-700',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        error: 'bg-red-50 text-red-700',
        outline: 'border border-gray-200 text-gray-600 bg-white',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px] rounded',
        sm: 'px-2 py-0.5 text-[11px] rounded',
        md: 'px-2.5 py-1 text-xs rounded-md',
        lg: 'px-3 py-1.5 text-sm rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
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
