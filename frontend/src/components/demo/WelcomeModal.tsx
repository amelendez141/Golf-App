'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useDemoStore } from '@/lib/stores/demoStore';
import { useAuth } from '@/lib/auth';

export function WelcomeModal() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { setTourOpen, setTourStep } = useDemoStore();

  useEffect(() => {
    // Don't show welcome modal for authenticated users
    if (isAuthenticated) {
      return;
    }

    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem('linkup-welcome-seen');
    if (!hasSeenWelcome) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleClose = useCallback(() => {
    localStorage.setItem('linkup-welcome-seen', 'true');
    setIsOpen(false);
  }, []);

  const handleStartTour = useCallback(() => {
    localStorage.setItem('linkup-welcome-seen', 'true');
    setIsOpen(false);
    // Start the guided tour after a brief delay
    setTimeout(() => {
      setTourStep(0);
      setTourOpen(true);
    }, 300);
  }, [setTourOpen, setTourStep]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-lg flex items-center justify-center"
          >
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden w-full max-h-[90vh] overflow-y-auto">
              {/* Hero section */}
              <div className="bg-hero-gradient p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 grain-overlay opacity-50" />
                {/* Animated golf ball */}
                <motion.div
                  className="absolute top-4 right-8 w-8 h-8 bg-white rounded-full shadow-lg"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  </div>
                </motion.div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    <span className="text-white/90 text-sm font-medium">Live Demo</span>
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-white mb-2">
                    Welcome to LinkUp Golf
                  </h1>
                  <p className="text-white/80">
                    Where professionals connect on the course
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <p className="text-text-secondary text-center">
                  This is a fully functional demo with real data. Experience the app as different professionals:
                </p>

                <div className="space-y-3">
                  <Feature
                    icon="users"
                    title="60+ Demo Professionals"
                    description="Finance, Tech, Healthcare, Legal, and more"
                  />
                  <Feature
                    icon="map"
                    title="45 Real Golf Courses"
                    description="Pebble Beach, Augusta, St Andrews, and others"
                  />
                  <Feature
                    icon="calendar"
                    title="190+ Open Tee Times"
                    description="Join groups and see the matching algorithm"
                  />
                  <Feature
                    icon="switch"
                    title="Switch Users Anytime"
                    description="Use the switcher in the bottom-left corner"
                  />
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button onClick={handleStartTour} fullWidth size="lg" variant="accent">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    Take a Guided Tour
                  </Button>
                  <Button onClick={handleClose} fullWidth size="lg" variant="primary">
                    Start Exploring
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <p className="text-xs text-text-muted">
                    No account needed. All features are available.
                  </p>
                </div>

                {/* Keyboard shortcut hint */}
                <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                  <span>Pro tip: Press</span>
                  <kbd className="px-1.5 py-0.5 bg-primary/5 border border-primary/10 rounded text-xs font-mono">
                    Ctrl+Shift+D
                  </kbd>
                  <span>for showcase mode</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: 'users' | 'map' | 'calendar' | 'switch';
  title: string;
  description: string;
}) {
  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
        <FeatureIcon name={icon} className="w-5 h-5 text-accent" />
      </div>
      <div>
        <h3 className="font-medium text-primary text-sm">{title}</h3>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </motion.div>
  );
}

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'users':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case 'map':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    case 'switch':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      );
    default:
      return null;
  }
}
