'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-2xl bg-white transition-all duration-300 border',
  {
    variants: {
      variant: {
        default: 'border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.04)]',
        elevated: 'border-black/[0.03] shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.06)]',
        flat: 'border-black/[0.06] shadow-none bg-white/80',
        interactive: 'cursor-pointer border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.04)]',
        glass: 'bg-white/70 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-5 sm:p-6',
        lg: 'p-6 sm:p-8',
        xl: 'p-8 sm:p-10',
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
  noAnimation?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, noAnimation = false, ...props }, ref) => {
    const isInteractive = variant === 'interactive' || variant === 'elevated';

    if (noAnimation || (!isInteractive && variant !== 'elevated')) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, padding, className }))}
          {...props}
        />
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        whileHover={{
          y: -6,
          boxShadow: '0 4px 8px rgba(0,0,0,0.03), 0 16px 40px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.06)',
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
          },
        }}
        whileTap={variant === 'interactive' ? {
          y: -3,
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
    className={cn('font-serif text-xl font-bold tracking-tight leading-tight', className)}
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
    className={cn('flex items-center pt-5', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
