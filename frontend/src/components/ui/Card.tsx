'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'bg-white rounded-lg border transition-all duration-150 ease-out-expo',
  {
    variants: {
      variant: {
        default: 'border-gray-200/60 shadow-card',
        elevated: 'border-gray-200/40 shadow-md',
        flat: 'border-gray-200/80 shadow-none',
        interactive: 'border-gray-200/60 shadow-card cursor-pointer hover:border-gray-300 hover:shadow-card-hover',
        ghost: 'border-transparent shadow-none bg-transparent',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
        xl: 'p-6',
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
    const isInteractive = variant === 'interactive';

    if (noAnimation) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn(cardVariants({ variant, padding, className }))}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        />
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        whileHover={isInteractive ? {
          y: -2,
          transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
        } : undefined}
        whileTap={isInteractive ? {
          y: 0,
          scale: 0.995,
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
    className={cn('flex flex-col space-y-1', className)}
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
    className={cn('text-base font-semibold text-gray-900 tracking-tight', className)}
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
    className={cn('text-sm text-gray-500', className)}
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
