'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-2xl bg-card transition-all duration-200 border border-primary/[0.04]',
  {
    variants: {
      variant: {
        default: 'shadow-card',
        elevated: 'shadow-card-elevated',
        flat: 'border border-primary/5 shadow-none',
        interactive: 'cursor-pointer shadow-card',
        glass: 'bg-white/80 backdrop-blur-md shadow-glass border-white/20',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4 sm:p-5',
        lg: 'p-5 sm:p-6',
        xl: 'p-6 sm:p-8',
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
          boxShadow: '0 1px 3px rgba(27, 58, 45, 0.04), 0 4px 12px rgba(27, 58, 45, 0.06)',
        }}
        whileHover={{
          y: -6,
          boxShadow: '0 20px 50px -12px rgba(27, 58, 45, 0.15), 0 30px 60px -20px rgba(196, 162, 101, 0.08)',
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
          },
        }}
        whileTap={variant === 'interactive' ? {
          y: -3,
          scale: 0.985,
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
