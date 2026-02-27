'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: [
          'text-white',
          'bg-gradient-to-b from-[rgb(40,80,60)] to-[rgb(20,50,38)]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(20,50,38,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_20px_rgba(20,50,38,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]',
          'active:shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.1)]',
          'border border-black/10',
        ].join(' '),
        secondary: [
          'text-primary bg-white',
          'border border-black/[0.08]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)]',
          'hover:bg-gray-50 hover:border-black/[0.12]',
          'hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.04)]',
        ].join(' '),
        accent: [
          'text-white',
          'bg-gradient-to-b from-[rgb(200,160,90)] to-[rgb(170,130,60)]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_16px_rgba(180,140,70,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]',
          'hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_24px_rgba(180,140,70,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]',
          'border border-[rgb(150,115,50)]/30',
        ].join(' '),
        ghost: 'text-primary hover:bg-black/[0.04] active:bg-black/[0.06]',
        outline: [
          'border-2 border-black/[0.1] text-primary',
          'hover:bg-black/[0.02] hover:border-black/[0.15]',
        ].join(' '),
        danger: [
          'text-white',
          'bg-gradient-to-b from-[rgb(240,80,80)] to-[rgb(220,50,50)]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(220,50,50,0.25)]',
          'border border-red-700/30',
        ].join(' '),
        link: 'text-accent font-medium underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-5 text-sm',
        lg: 'h-[52px] px-7 text-[15px]',
        xl: 'h-14 px-8 text-base',
        icon: 'h-12 w-12',
        'icon-sm': 'h-10 w-10',
        'icon-lg': 'h-14 w-14',
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
        whileHover={!isDisabled && !isLink ? {
          scale: 1.01,
          y: -1,
        } : undefined}
        whileTap={!isDisabled && !isLink ? {
          scale: 0.98,
          y: 0,
        } : undefined}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
        }}
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
    <motion.svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
}

export { Button, buttonVariants };
