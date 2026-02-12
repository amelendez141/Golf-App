'use client';

import { useEffect, useState } from 'react';
import { LiveActivityFeed } from './LiveActivityFeed';
import { QuickTourModal } from './QuickTourModal';
import { ShowcaseMode } from './ShowcaseMode';

/**
 * DemoFeatures - Wrapper component that renders all demo-specific features.
 * This should be included in the app layout to enable:
 * - Live activity feed (floating widget)
 * - Quick tour modal (guided tour)
 * - Showcase mode (auto-play through the app)
 *
 * Usage:
 * Include <DemoFeatures /> in your root layout or providers.
 *
 * Keyboard shortcuts:
 * - Ctrl+Shift+D: Toggle showcase mode
 * - Escape: Exit showcase mode or close tour
 */
export function DemoFeatures() {
  const [mounted, setMounted] = useState(false);

  // Only render on client to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Live activity feed - shows simulated real-time user activity */}
      <LiveActivityFeed />

      {/* Quick tour modal - guided feature walkthrough */}
      <QuickTourModal />

      {/* Showcase mode - auto-plays through the app */}
      <ShowcaseMode />
    </>
  );
}
