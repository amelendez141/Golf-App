'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Tee Time Detail Error Page
 * Handles errors when loading a specific tee time
 */
export default function TeeTimeError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Tee time error:', error);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[60vh]">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Lost Golf Ball Illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <LostBallIcon className="w-full h-full text-primary/20" />
        </div>

        {/* Error Heading */}
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
          Tee Time Trouble
        </h2>

        {/* Error Message */}
        <p className="text-text-secondary mb-2">
          We couldn&apos;t load this tee time right now.
        </p>
        <p className="text-text-muted mb-8">
          The booking might have been modified, or we&apos;re experiencing a
          temporary issue. Let&apos;s try finding it again.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            leftIcon={<RefreshIcon />}
          >
            Reload Tee Time
          </Button>
          <Link href="/feed">
            <Button variant="secondary" leftIcon={<SearchIcon />}>
              Browse Tee Times
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-sm text-text-muted mb-3">Other options:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/my-times" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              My Tee Times
            </Link>
            <span className="text-text-muted">|</span>
            <Link href="/explore" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              Explore Courses
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

// Lost Golf Ball in Tall Grass SVG
function LostBallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tall grass blades */}
      <path d="M20 110 Q25 70, 22 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M30 110 Q38 65, 32 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M42 110 Q48 75, 44 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M55 110 Q50 80, 56 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M70 110 Q65 70, 72 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M85 110 Q80 75, 88 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M98 110 Q95 80, 100 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M108 110 Q112 75, 106 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Golf ball partially hidden */}
      <circle cx="64" cy="88" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="58" cy="84" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="70" cy="84" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="64" cy="94" r="3" fill="currentColor" fillOpacity="0.3" />

      {/* Question mark above */}
      <path
        d="M64 20 Q68 20, 70 24 Q72 28, 68 32 Q64 36, 64 42"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <circle cx="64" cy="52" r="2.5" fill="currentColor" fillOpacity="0.6" />

      {/* Ground line */}
      <path
        d="M10 115 Q30 112, 64 115 T118 115"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
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

// Search Icon
function SearchIcon({ className }: { className?: string }) {
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
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
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
