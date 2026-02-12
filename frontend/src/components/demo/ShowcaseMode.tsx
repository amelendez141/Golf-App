'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useDemoStore, SHOWCASE_STEPS } from '@/lib/stores/demoStore';
import { cn } from '@/lib/utils';

export function ShowcaseMode() {
  const router = useRouter();
  const pathname = usePathname();
  const { isShowcaseMode, showcaseStep, setShowcaseMode, nextShowcaseStep } = useDemoStore();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowcaseMode(!isShowcaseMode);
      }
      // Escape to exit showcase mode
      if (e.key === 'Escape' && isShowcaseMode) {
        setShowcaseMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShowcaseMode, setShowcaseMode]);

  // Auto-advance through showcase steps
  useEffect(() => {
    if (!isShowcaseMode) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(0);
      return;
    }

    const currentStep = SHOWCASE_STEPS[showcaseStep];
    if (!currentStep) return;

    // Navigate to the step's page
    if (pathname !== currentStep.page) {
      router.push(currentStep.page);
    }

    // Progress bar animation
    setProgress(0);
    const progressInterval = 50; // Update every 50ms
    const progressIncrement = (progressInterval / currentStep.duration) * 100;

    progressRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + progressIncrement, 100));
    }, progressInterval);

    // Auto-advance after duration
    timerRef.current = setTimeout(() => {
      nextShowcaseStep();
    }, currentStep.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isShowcaseMode, showcaseStep, pathname, router, nextShowcaseStep]);

  const handleExit = useCallback(() => {
    setShowcaseMode(false);
  }, [setShowcaseMode]);

  const handleSkipToNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    nextShowcaseStep();
  }, [nextShowcaseStep]);

  const handleSkipToPrevious = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    const { showcaseStep, setShowcaseStep } = useDemoStore.getState();
    if (showcaseStep > 0) {
      setShowcaseStep(showcaseStep - 1);
    }
  }, []);

  if (!mounted || !isShowcaseMode) return null;

  const currentStep = SHOWCASE_STEPS[showcaseStep];

  return createPortal(
    <AnimatePresence>
      {/* Showcase overlay controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-[200] pointer-events-none"
      >
        {/* Progress bar */}
        <div className="h-1 bg-primary/10">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>

        {/* Control bar */}
        <div className="bg-primary/95 backdrop-blur-md text-white pointer-events-auto">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Showcase badge */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-sm font-semibold">Showcase Mode</span>
              </div>

              {/* Step indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-white/60">Step {showcaseStep + 1}/{SHOWCASE_STEPS.length}:</span>
                <span className="text-sm font-medium">{currentStep?.description}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Navigation controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSkipToPrevious}
                  disabled={showcaseStep === 0}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    showcaseStep === 0
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                  aria-label="Previous step"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={handleSkipToNext}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Next step"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {/* Step dots */}
              <div className="hidden md:flex items-center gap-1.5">
                {SHOWCASE_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      index === showcaseStep
                        ? 'w-4 bg-accent'
                        : index < showcaseStep
                        ? 'w-1.5 bg-white/60'
                        : 'w-1.5 bg-white/20'
                    )}
                  />
                ))}
              </div>

              {/* Exit button */}
              <button
                onClick={handleExit}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
              >
                <span className="hidden sm:inline">Exit</span>
                <span className="text-xs text-white/60">(Esc)</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keyboard shortcut hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 left-4 z-[200] bg-primary/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-xl"
      >
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span className="text-white/80">Press</span>
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">Ctrl+Shift+D</kbd>
          <span className="text-white/80">to toggle showcase</span>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// Floating button to trigger showcase mode
export function ShowcaseTriggerButton({ className }: { className?: string }) {
  const { isShowcaseMode, setShowcaseMode } = useDemoStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    setShowcaseMode(true);
  }, [setShowcaseMode]);

  if (isShowcaseMode) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl',
        'bg-gradient-to-r from-accent to-accent-600 text-white',
        'shadow-lg hover:shadow-xl transition-shadow',
        className
      )}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
      <span className="font-medium">Showcase</span>
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="text-xs text-white/80 whitespace-nowrap overflow-hidden"
          >
            (Ctrl+Shift+D)
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
