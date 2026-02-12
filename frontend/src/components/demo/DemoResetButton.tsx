'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useDemoStore } from '@/lib/stores/demoStore';
import { cn } from '@/lib/utils';

interface DemoResetButtonProps {
  variant?: 'button' | 'icon' | 'text';
  className?: string;
}

export function DemoResetButton({ variant = 'button', className }: DemoResetButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { resetDemo } = useDemoStore();

  const handleClick = useCallback(() => {
    if (!isConfirming) {
      setIsConfirming(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setIsConfirming(false), 3000);
    } else {
      setIsResetting(true);
      // Small delay for visual feedback before reload
      setTimeout(() => {
        resetDemo();
      }, 500);
    }
  }, [isConfirming, resetDemo]);

  const handleCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
  }, []);

  if (variant === 'icon') {
    return (
      <div className={cn('relative', className)}>
        <AnimatePresence mode="wait">
          {isConfirming ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <Button
                variant="danger"
                size="icon-sm"
                onClick={handleClick}
                isLoading={isResetting}
                aria-label="Confirm reset"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCancel}
                aria-label="Cancel reset"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="reset"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClick}
                className="text-text-muted hover:text-primary"
                aria-label="Reset demo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        disabled={isResetting}
        className={cn(
          'text-sm transition-colors',
          isConfirming
            ? 'text-error font-medium'
            : 'text-text-muted hover:text-primary',
          className
        )}
      >
        {isResetting ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Resetting...
          </span>
        ) : isConfirming ? (
          <span className="flex items-center gap-2">
            Click again to confirm reset
            <button
              onClick={handleCancel}
              className="text-text-muted hover:text-primary ml-1"
            >
              (cancel)
            </button>
          </span>
        ) : (
          'Reset Demo'
        )}
      </button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        {isConfirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="danger"
              size="sm"
              onClick={handleClick}
              isLoading={isResetting}
            >
              Confirm Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="reset"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              }
            >
              Reset Demo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
