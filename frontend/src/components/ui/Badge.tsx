'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { Industry, SkillLevel } from '@/lib/types';
import { getIndustryInfo, getSkillLevelInfo } from '@/lib/constants';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold tracking-tight transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary/[0.08] text-primary border border-primary/[0.08]',
        secondary: 'bg-secondary-200 text-text-secondary border border-secondary-300',
        accent: 'bg-accent/10 text-accent-700 border border-accent/15',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        error: 'bg-red-50 text-red-700 border border-red-100',
        outline: 'border-2 border-primary/15 text-primary bg-transparent',
        premium: 'bg-gradient-to-r from-accent/15 to-accent/5 text-accent-700 border border-accent/20',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-[11px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-3.5 py-1.5 text-sm',
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
