'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root Error Page
 * Handles errors at the application root level
 */
export default function RootError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Root error:', error);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto text-center">
        {/* Golf Course with Storm Cloud Illustration */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <GolfCourseStormIcon className="w-full h-full text-primary/20" />
        </div>

        {/* Error Heading */}
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-4">
          Weather Delay
        </h1>

        {/* Error Message */}
        <p className="text-text-secondary text-lg mb-2">
          We&apos;ve encountered an unexpected condition on the course.
        </p>
        <p className="text-text-muted mb-8">
          Our team is working to clear the fairway. In the meantime, you can try
          again or head back to the clubhouse.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={reset}
            leftIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
          <Link href="/feed">
            <Button variant="secondary" size="lg" leftIcon={<HomeIcon />}>
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Error Reference (for support) */}
        {error.digest && (
          <p className="mt-8 text-xs text-text-muted">
            Error Reference: <code className="font-mono">{error.digest}</code>
          </p>
        )}

        {/* Dev Mode Error Details */}
        {isDev && (
          <div className="mt-8 text-left">
            <details className="group bg-card rounded-xl border border-primary/10 overflow-hidden">
              <summary className="cursor-pointer p-4 text-sm text-text-muted hover:text-text-secondary transition-colors">
                <span className="inline-flex items-center gap-2">
                  <ChevronIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
                  View error details (dev only)
                </span>
              </summary>
              <div className="px-4 pb-4">
                <div className="p-4 bg-primary/5 rounded-lg overflow-auto">
                  <p className="text-sm font-mono text-error mb-2">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="text-xs font-mono text-text-muted whitespace-pre-wrap break-words mt-2">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Golf Course with Storm Cloud SVG
function GolfCourseStormIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cloud */}
      <path
        d="M40 50 Q30 50, 30 40 Q30 28, 45 28 Q48 18, 60 18 Q72 18, 78 28 Q80 26, 85 26 Q98 26, 100 40 Q100 50, 90 50 Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Rain drops */}
      <line x1="45" y1="55" x2="42" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="60" y1="55" x2="57" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="75" y1="55" x2="72" y2="63" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="90" y1="55" x2="87" y2="67" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* Lightning bolt */}
      <path
        d="M70 52 L62 72 L72 72 L64 90"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />

      {/* Ground/Green */}
      <path
        d="M10 130 Q40 120, 80 125 T150 130 L150 145 L10 145 Z"
        fill="currentColor"
        fillOpacity="0.15"
      />

      {/* Flag pole */}
      <line x1="110" y1="85" x2="110" y2="130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Flag */}
      <path
        d="M110 85 L130 95 L110 105 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Hole */}
      <ellipse cx="110" cy="132" rx="8" ry="3" fill="currentColor" fillOpacity="0.3" />

      {/* Golf ball */}
      <circle cx="90" cy="126" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="88" cy="124" r="1.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="92" cy="124" r="1.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="90" cy="128" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// Refresh Icon
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'h-5 w-5'}
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

// Home Icon
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'h-5 w-5'}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
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
