'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { cardHoverVariants, EASING } from '@/lib/animations';

const animatedCardVariants = cva(
  'rounded-xl bg-card transition-colors duration-200',
  {
    variants: {
      variant: {
        default: '',
        elevated: '',
        flat: 'border border-primary/5',
        interactive: 'cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface AnimatedCardProps
  extends Omit<HTMLMotionProps<'div'>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>,
    VariantProps<typeof animatedCardVariants> {
  /** Enable hover lift effect */
  hoverLift?: boolean;
  /** Enable press/tap effect */
  pressEffect?: boolean;
  /** Custom hover scale */
  hoverScale?: number;
}

/**
 * Card component with smooth hover lift and press animations.
 * Use this for interactive cards that benefit from micro-interactions.
 */
export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      className,
      variant,
      padding,
      hoverLift = true,
      pressEffect = true,
      hoverScale,
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = variant === 'interactive' || hoverLift || pressEffect;

    return (
      <motion.div
        ref={ref}
        className={cn(animatedCardVariants({ variant, padding, className }))}
        initial="initial"
        whileHover={isInteractive ? 'hover' : undefined}
        whileTap={pressEffect ? 'tap' : undefined}
        variants={{
          initial: {
            y: 0,
            scale: 1,
            boxShadow: '0 2px 8px -2px rgba(27, 58, 45, 0.08), 0 4px 16px -4px rgba(27, 58, 45, 0.12)',
          },
          hover: {
            y: hoverLift ? -4 : 0,
            scale: hoverScale || 1,
            boxShadow: hoverLift
              ? '0 12px 32px -8px rgba(27, 58, 45, 0.15), 0 16px 48px -12px rgba(27, 58, 45, 0.2)'
              : '0 2px 8px -2px rgba(27, 58, 45, 0.08), 0 4px 16px -4px rgba(27, 58, 45, 0.12)',
            transition: {
              duration: 0.2,
              ease: EASING.decelerate,
            },
          },
          tap: {
            y: -2,
            scale: 0.98,
            transition: {
              duration: 0.1,
            },
          },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
