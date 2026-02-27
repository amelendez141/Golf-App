'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-white border border-primary',
          'hover:bg-primary/90',
          'active:bg-primary/85',
          'shadow-button',
        ].join(' '),
        secondary: [
          'bg-white text-gray-700 border border-gray-200',
          'hover:bg-gray-50 hover:border-gray-300',
          'active:bg-gray-100',
        ].join(' '),
        accent: [
          'bg-accent text-white border border-accent',
          'hover:bg-accent/90',
          'active:bg-accent/85',
          'shadow-button',
        ].join(' '),
        ghost: [
          'bg-transparent text-gray-600 border border-transparent',
          'hover:bg-gray-100 hover:text-gray-900',
          'active:bg-gray-200',
        ].join(' '),
        outline: [
          'bg-transparent text-gray-700 border border-gray-200',
          'hover:bg-gray-50 hover:border-gray-300',
          'active:bg-gray-100',
        ].join(' '),
        danger: [
          'bg-error text-white border border-error',
          'hover:bg-error/90',
          'active:bg-error/85',
        ].join(' '),
        link: [
          'text-accent underline-offset-4 hover:underline',
          'p-0 h-auto border-none',
        ].join(' '),
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-9 px-4 text-sm rounded-md',
        lg: 'h-10 px-5 text-sm rounded-lg',
        xl: 'h-11 px-6 text-base rounded-lg',
        icon: 'h-9 w-9 rounded-md',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-10 w-10 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type MotionButtonProps = Omit<
  HTMLMotionProps<'button'>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
>;

export interface ButtonProps
  extends MotionButtonProps,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const isLink = variant === 'link';

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        whileTap={!isDisabled && !isLink ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {leftIcon && <span className="shrink-0 -ml-0.5">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0 -mr-0.5">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export { Button, buttonVariants };
