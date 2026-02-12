'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TourTriggerButton } from './QuickTourModal';
import { DemoResetButton } from './DemoResetButton';
import { ShowcaseTriggerButton } from './ShowcaseMode';
import { cn } from '@/lib/utils';

interface DemoStats {
  users: number;
  courses: number;
  teeTimes: number;
  openTeeTimes: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Animated counter component
function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function DemoBanner() {
  const [stats, setStats] = useState<DemoStats | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_URL}/api/demo/stats`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch demo stats:', error);
        // Use fallback stats for demo
        setStats({
          users: 60,
          courses: 45,
          teeTimes: 190,
          openTeeTimes: 85,
        });
      }
    }
    fetchStats();
  }, []);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-accent via-accent-600 to-primary text-white relative overflow-hidden"
    >
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      <div className="max-w-7xl mx-auto px-4 py-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-sm font-semibold">Demo Mode</span>
            </span>

            {/* Animated stats */}
            {stats && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">
                    <AnimatedNumber value={stats.users} />
                  </span>
                  <span className="text-white/70">professionals</span>
                </span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">
                    <AnimatedNumber value={stats.courses} />
                  </span>
                  <span className="text-white/70">courses</span>
                </span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">
                    <AnimatedNumber value={stats.openTeeTimes} />
                  </span>
                  <span className="text-white/70">open tee times</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Expand/collapse button for mobile */}
            <button
              onClick={handleToggleExpand}
              className="sm:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isExpanded ? 'Collapse demo tools' : 'Expand demo tools'}
            >
              <svg
                className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Desktop controls */}
            <div className="hidden sm:flex items-center gap-2">
              <TourTriggerButton />
              <ShowcaseTriggerButton className="!py-1.5 !text-sm" />
              <DemoResetButton variant="icon" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden"
            >
              <div className="pt-3 pb-1 space-y-3">
                {/* Mobile stats */}
                {stats && (
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="flex flex-col items-center">
                      <span className="font-semibold text-lg">
                        <AnimatedNumber value={stats.users} />
                      </span>
                      <span className="text-white/70 text-xs">professionals</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-semibold text-lg">
                        <AnimatedNumber value={stats.courses} />
                      </span>
                      <span className="text-white/70 text-xs">courses</span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="font-semibold text-lg">
                        <AnimatedNumber value={stats.openTeeTimes} />
                      </span>
                      <span className="text-white/70 text-xs">open tee times</span>
                    </span>
                  </div>
                )}

                {/* Mobile controls */}
                <div className="flex items-center justify-center gap-2">
                  <TourTriggerButton />
                  <ShowcaseTriggerButton className="!py-1.5 !text-sm" />
                  <DemoResetButton variant="button" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
