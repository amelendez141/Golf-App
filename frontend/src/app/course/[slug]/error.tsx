'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Course Detail Error Page
 * Handles errors when loading a specific course
 */
export default function CourseError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Course error:', error);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[60vh]">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Closed Course Gate Illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <ClosedCourseIcon className="w-full h-full text-primary/20" />
        </div>

        {/* Error Heading */}
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
          Course Unavailable
        </h2>

        {/* Error Message */}
        <p className="text-text-secondary mb-2">
          We couldn&apos;t load this course information right now.
        </p>
        <p className="text-text-muted mb-8">
          The course details might be temporarily unavailable.
          Let&apos;s try again or explore other courses nearby.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            leftIcon={<RefreshIcon />}
          >
            Reload Course
          </Button>
          <Link href="/explore">
            <Button variant="secondary" leftIcon={<MapIcon />}>
              Explore Courses
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-sm text-text-muted mb-3">Quick actions:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/feed" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              Browse Tee Times
            </Link>
            <span className="text-text-muted">|</span>
            <Link href="/my-times" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              My Bookings
            </Link>
          </div>
        </div>

        {/* Error Reference */}
        {error.digest && (
          <p className="mt-6 text-xs text-text-muted">
            Reference: <code className="font-mono bg-primary/5 px-2 py-0.5 rounded">{error.digest}</code>
          </p>
        )}

        {/* Dev Mode Error Details */}
        {isDev && (
          <div className="mt-6 text-left">
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

// Closed Course Gate SVG
function ClosedCourseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left post */}
      <rect x="20" y="35" width="8" height="75" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="35" r="5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />

      {/* Right post */}
      <rect x="100" y="35" width="8" height="75" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="104" cy="35" r="5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />

      {/* Gate bars */}
      <line x1="28" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Vertical bars */}
      <line x1="50" y1="50" x2="50" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="50" x2="78" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Lock */}
      <rect x="58" y="60" width="12" height="10" rx="2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M61 60 L61 55 Q64 50, 67 55 L67 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* "Closed" sign */}
      <rect x="40" y="90" width="48" height="20" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <line x1="50" y1="98" x2="78" y2="98" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="55" y1="104" x2="73" y2="104" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* Golf flag in background */}
      <line x1="64" y1="10" x2="64" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M64 10 L78 16 L64 22 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" opacity="0.3" />

      {/* Ground */}
      <path d="M10 115 Q64 110, 118 115" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
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

// Map Icon
function MapIcon({ className }: { className?: string }) {
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
        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
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
