'use client';

import { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full text-sm text-gray-900 bg-white border rounded-md transition-all duration-100 ease-out placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
  {
    variants: {
      variant: {
        default: 'border-gray-200 hover:border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/20',
        error: 'border-error/50 focus:border-error focus:ring-2 focus:ring-error/20',
        success: 'border-success/50 focus:border-success focus:ring-2 focus:ring-success/20',
      },
      inputSize: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-sm',
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
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
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
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-gray-500">
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
            'peer pt-5 pb-1.5',
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
            'pointer-events-none absolute left-3 transition-all duration-100',
            isFocused || hasValue
              ? 'top-1.5 text-xs text-accent font-medium'
              : 'top-1/2 -translate-y-1/2 text-sm text-gray-400',
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
