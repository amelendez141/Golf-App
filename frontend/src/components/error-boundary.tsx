'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo?: ErrorInfo | null;
  onReset?: () => void;
  className?: string;
}

/**
 * Default Error Fallback UI
 * A beautiful, golf-themed error display that matches the premium design aesthetic
 */
export function ErrorFallback({
  error,
  errorInfo,
  onReset,
  className,
}: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div
      className={cn(
        'min-h-[400px] flex flex-col items-center justify-center py-16 px-4',
        className
      )}
    >
      <div className="w-full max-w-md mx-auto text-center">
        {/* Golf Ball in Bunker Illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <GolfBallInBunkerIcon className="w-full h-full text-primary/20" />
        </div>

        {/* Error Message */}
        <h2 className="font-serif text-2xl font-semibold text-primary mb-3">
          Looks like we&apos;re in the rough
        </h2>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">
          Something unexpected happened. Don&apos;t worry, even the pros hit a few
          bad shots. Let&apos;s get you back on the fairway.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onReset && (
            <Button variant="primary" onClick={onReset} leftIcon={<RefreshIcon />}>
              Try Again
            </Button>
          )}
          <Link href="/feed">
            <Button variant="secondary" leftIcon={<HomeIcon />}>
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Dev Mode Error Details */}
        {isDev && error && (
          <div className="mt-8 text-left">
            <details className="group">
              <summary className="cursor-pointer text-sm text-text-muted hover:text-text-secondary transition-colors">
                <span className="inline-flex items-center gap-2">
                  <ChevronIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
                  View error details (dev only)
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
                {errorInfo?.componentStack && (
                  <>
                    <p className="text-sm font-mono text-text-secondary mt-4 mb-2">
                      Component Stack:
                    </p>
                    <pre className="text-xs font-mono text-text-muted whitespace-pre-wrap break-words">
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Golf Ball in Bunker SVG Icon
function GolfBallInBunkerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sand/Bunker base with wave pattern */}
      <path
        d="M8 88 Q24 82, 40 88 T72 88 T104 88 T120 88 L120 120 L8 120 Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M8 96 Q24 90, 40 96 T72 96 T104 96 T120 96"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Golf Ball */}
      <circle cx="64" cy="68" r="24" stroke="currentColor" strokeWidth="2.5" fill="none" />

      {/* Golf Ball Dimples */}
      <circle cx="56" cy="60" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="72" cy="60" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="64" cy="72" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="54" cy="72" r="2.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="74" cy="72" r="2.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="64" cy="56" r="2.5" fill="currentColor" fillOpacity="0.2" />

      {/* Sand splash effect */}
      <path
        d="M40 78 Q44 70, 48 78"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M80 78 Q84 72, 88 78"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Small impact lines */}
      <line x1="36" y1="86" x2="32" y2="82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="92" y1="86" x2="96" y2="82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// Refresh Icon
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
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
      className={cn('h-4 w-4', className)}
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
      className={cn('h-4 w-4', className)}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default ErrorBoundary;
