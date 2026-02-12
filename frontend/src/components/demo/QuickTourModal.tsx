'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useDemoStore, TOUR_STEPS } from '@/lib/stores/demoStore';

const SPOTLIGHT_PADDING = 16;

function getIconComponent(iconName: string): React.ReactNode {
  switch (iconName) {
    case 'calendar':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case 'chat':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      );
    default:
      return null;
  }
}

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export function QuickTourModal() {
  const { isTourOpen, tourStep, setTourOpen, nextTourStep, prevTourStep, setHasSeenTour } = useDemoStore();
  const [spotlightPosition, setSpotlightPosition] = useState<SpotlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentStep = TOUR_STEPS[tourStep];

  // Calculate spotlight and tooltip positions
  useEffect(() => {
    if (!isTourOpen || !currentStep) return;

    const updatePositions = () => {
      // For demo purposes, use fallback positions if elements not found
      const targetEl = document.querySelector(currentStep.target);

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setSpotlightPosition({
          top: rect.top - SPOTLIGHT_PADDING,
          left: rect.left - SPOTLIGHT_PADDING,
          width: rect.width + SPOTLIGHT_PADDING * 2,
          height: rect.height + SPOTLIGHT_PADDING * 2,
        });

        // Calculate tooltip position based on step position preference
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        let top = 0;
        let left = 0;

        switch (currentStep.position) {
          case 'bottom':
            top = rect.bottom + SPOTLIGHT_PADDING + 16;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - SPOTLIGHT_PADDING - 16;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + SPOTLIGHT_PADDING + 16;
            break;
          default:
            top = rect.bottom + SPOTLIGHT_PADDING + 16;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
        }

        // Keep tooltip in viewport
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

        setTooltipPosition({ top, left });
      } else {
        // Fallback: center the spotlight and tooltip
        setSpotlightPosition(null);
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 160,
        });
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [isTourOpen, currentStep, tourStep]);

  const handleClose = useCallback(() => {
    setTourOpen(false);
    setHasSeenTour(true);
  }, [setTourOpen, setHasSeenTour]);

  const handleSkip = useCallback(() => {
    setTourOpen(false);
    setHasSeenTour(true);
  }, [setTourOpen, setHasSeenTour]);

  if (!mounted || !isTourOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop with spotlight cutout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          {/* Dark overlay with spotlight cutout using CSS mask */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            style={spotlightPosition ? {
              maskImage: `
                radial-gradient(
                  ellipse ${spotlightPosition.width / 2 + 20}px ${spotlightPosition.height / 2 + 20}px
                  at ${spotlightPosition.left + spotlightPosition.width / 2}px ${spotlightPosition.top + spotlightPosition.height / 2}px,
                  transparent 70%,
                  black 100%
                )
              `,
              WebkitMaskImage: `
                radial-gradient(
                  ellipse ${spotlightPosition.width / 2 + 20}px ${spotlightPosition.height / 2 + 20}px
                  at ${spotlightPosition.left + spotlightPosition.width / 2}px ${spotlightPosition.top + spotlightPosition.height / 2}px,
                  transparent 70%,
                  black 100%
                )
              `,
            } : undefined}
          />

          {/* Spotlight ring effect */}
          {spotlightPosition && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="absolute rounded-2xl border-2 border-accent shadow-[0_0_30px_rgba(196,162,101,0.3)]"
              style={{
                top: spotlightPosition.top,
                left: spotlightPosition.left,
                width: spotlightPosition.width,
                height: spotlightPosition.height,
              }}
            />
          )}
        </motion.div>

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="absolute w-80 bg-card rounded-2xl shadow-2xl overflow-hidden"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {/* Step indicator */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    index === tourStep
                      ? 'w-6 bg-accent'
                      : index < tourStep
                      ? 'w-1.5 bg-accent/50'
                      : 'w-1.5 bg-primary/20'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-text-muted">
              {tourStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                {currentStep && getIconComponent(currentStep.icon)}
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg text-primary">
                  {currentStep?.title}
                </h3>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  {currentStep?.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-primary/5">
              <button
                onClick={handleSkip}
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevTourStep}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="accent"
                  size="sm"
                  onClick={nextTourStep}
                >
                  {tourStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          aria-label="Close tour"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </AnimatePresence>,
    document.body
  );
}

// Button to trigger the tour
export function TourTriggerButton() {
  const { setTourOpen, setTourStep } = useDemoStore();

  const handleStartTour = useCallback(() => {
    setTourStep(0);
    setTourOpen(true);
  }, [setTourOpen, setTourStep]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartTour}
      leftIcon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      }
    >
      Take a Tour
    </Button>
  );
}
