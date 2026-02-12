'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      searchable = false,
      disabled = false,
      className,
      label,
      error,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opened with search
    useEffect(() => {
      if (isOpen && searchable) {
        inputRef.current?.focus();
      }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      } else if (e.key === 'Enter' && filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value);
      }
    };

    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div ref={containerRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-lg border bg-card px-4 text-sm transition-all duration-200',
              'border-primary/10 hover:border-primary/20',
              'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
              isOpen && 'ring-2 ring-accent/20 border-accent',
              error && 'border-error focus:ring-error/20 focus:border-error',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={cn(!selectedOption && 'text-text-muted')}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronIcon
              className={cn(
                'h-4 w-4 text-text-muted transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-primary/10 bg-card shadow-lg"
                role="listbox"
              >
                {searchable && (
                  <div className="border-b border-primary/5 p-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search..."
                      className="w-full rounded-md border border-primary/10 bg-secondary px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                  </div>
                )}
                <div className="max-h-60 overflow-auto p-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-center text-sm text-text-muted">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !option.disabled && handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                          'hover:bg-primary/5',
                          option.value === value && 'bg-accent/10 text-accent-600',
                          option.disabled && 'cursor-not-allowed opacity-50'
                        )}
                        role="option"
                        aria-selected={option.value === value}
                      >
                        {option.icon && (
                          <span className="shrink-0">{option.icon}</span>
                        )}
                        <span>{option.label}</span>
                        {option.value === value && (
                          <CheckIcon className="ml-auto h-4 w-4 text-accent" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export { Dropdown };
export type { DropdownOption };
