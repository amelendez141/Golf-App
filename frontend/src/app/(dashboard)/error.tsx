'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Dashboard Error Page
 * Handles errors within the dashboard route group
 */
export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard error:', error);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[60vh]">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Broken Golf Club Illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <BrokenClubIcon className="w-full h-full text-primary/20" />
        </div>

        {/* Error Heading */}
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
          Equipment Malfunction
        </h2>

        {/* Error Message */}
        <p className="text-text-secondary mb-2">
          Something went wrong while loading this page.
        </p>
        <p className="text-text-muted mb-8">
          Let&apos;s get you a fresh set of clubs and try again.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            leftIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
          <Link href="/feed">
            <Button variant="secondary" leftIcon={<FeedIcon />}>
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Error Reference */}
        {error.digest && (
          <p className="mt-6 text-xs text-text-muted">
            Reference: <code className="font-mono bg-primary/5 px-2 py-0.5 rounded">{error.digest}</code>
          </p>
        )}

        {/* Dev Mode Error Details */}
        {isDev && (
          <div className="mt-8 text-left">
            <details className="group">
              <summary className="cursor-pointer text-sm text-text-muted hover:text-text-secondary transition-colors">
                <span className="inline-flex items-center gap-2">
                  <ChevronIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
                  View error details
                </span>
              </summary>
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10 overflow-auto">
                <p className="text-sm font-mono text-error mb-2">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs font-mono text-text-muted whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Broken Golf Club SVG
function BrokenClubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Club head (driver) */}
      <path
        d="M20 30 Q15 25, 18 18 Q22 10, 35 12 Q42 13, 45 20 Q47 26, 42 32 L30 40 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Shaft piece 1 (connected to head) */}
      <line
        x1="42"
        y1="32"
        x2="55"
        y2="52"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Break point - jagged */}
      <path
        d="M55 52 L58 56 L54 58 L57 62"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Shaft piece 2 (broken off) */}
      <line
        x1="62"
        y1="68"
        x2="90"
        y2="110"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Second break mark */}
      <path
        d="M62 68 L59 64 L63 62 L60 58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Grip at bottom */}
      <line
        x1="90"
        y1="110"
        x2="100"
        y2="118"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Small impact lines */}
      <line x1="50" y1="48" x2="46" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="64" y1="62" x2="70" y2="58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* Sparkle/emphasis marks */}
      <circle cx="58" cy="55" r="2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="60" cy="65" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// Refresh Icon
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'h-4 w-4'}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

// Feed Icon
function FeedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'h-4 w-4'}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

// Chevron Icon
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'h-4 w-4'}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
