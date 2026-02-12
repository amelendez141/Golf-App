'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl bg-card transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'shadow-card',
        elevated: 'shadow-card',
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

type MotionDivProps = Omit<
  HTMLMotionProps<'div'>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
>;

export interface CardProps
  extends MotionDivProps,
    VariantProps<typeof cardVariants> {
  /** Disable hover animations */
  noAnimation?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, noAnimation = false, ...props }, ref) => {
    const isInteractive = variant === 'interactive' || variant === 'elevated';

    // For non-interactive cards, use simple div
    if (noAnimation || (!isInteractive && variant !== 'elevated')) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, padding, className }))}
          initial={{ boxShadow: '0 2px 8px -2px rgba(27, 58, 45, 0.08), 0 4px 16px -4px rgba(27, 58, 45, 0.12)' }}
          {...props}
        />
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        initial={{
          y: 0,
          boxShadow: '0 2px 8px -2px rgba(27, 58, 45, 0.08), 0 4px 16px -4px rgba(27, 58, 45, 0.12)',
        }}
        whileHover={{
          y: -4,
          boxShadow: '0 12px 32px -8px rgba(27, 58, 45, 0.15), 0 16px 48px -12px rgba(27, 58, 45, 0.2)',
          transition: {
            duration: 0.2,
            ease: [0, 0, 0.2, 1],
          },
        }}
        whileTap={variant === 'interactive' ? {
          y: -2,
          scale: 0.99,
          transition: { duration: 0.1 },
        } : undefined}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-serif text-lg font-semibold leading-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-muted', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
