'use client';

import { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-xl border bg-white text-[15px] transition-all duration-200 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]',
  {
    variants: {
      variant: {
        default:
          'border-black/[0.08] hover:border-black/[0.12] focus:border-accent focus:ring-4 focus:ring-accent/10 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_4px_rgba(180,140,70,0.1)]',
        error:
          'border-error/50 focus:border-error focus:ring-4 focus:ring-error/10',
        success:
          'border-success/50 focus:border-success focus:ring-4 focus:ring-success/10',
      },
      inputSize: {
        sm: 'h-11 px-4 text-[15px]',
        md: 'h-12 px-4 text-[15px]',
        lg: 'h-14 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      inputSize,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-gray-700 tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({
                variant: error ? 'error' : variant,
                inputSize,
              }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface FloatingInputProps extends InputProps {
  label: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, inputSize = 'lg', id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const inputId = id || props.name;

    return (
      <div className="relative w-full">
        <input
          id={inputId}
          className={cn(
            inputVariants({ variant: error ? 'error' : 'default', inputSize }),
            'peer pt-6 pb-2',
            className
          )}
          ref={ref}
          placeholder=" "
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          aria-invalid={!!error}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-4 transition-all duration-200',
            isFocused || hasValue
              ? 'top-2 text-xs text-accent'
              : 'top-1/2 -translate-y-1/2 text-sm text-text-muted',
            error && 'text-error'
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export { Input, FloatingInput, inputVariants };
