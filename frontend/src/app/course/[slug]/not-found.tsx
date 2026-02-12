import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Course Not Found Page
 * Displayed when a specific course doesn't exist
 */
export default function CourseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[60vh]">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Empty Golf Course Map Illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <MissingCourseIcon className="w-full h-full text-primary/20" />
        </div>

        {/* Error Badge */}
        <div className="inline-flex items-center justify-center px-3 py-1 mb-5 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-xs font-semibold text-accent tracking-wide">COURSE NOT FOUND</span>
        </div>

        {/* Error Heading */}
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
          Course Not on Our Map
        </h2>

        {/* Error Message */}
        <p className="text-text-secondary mb-2">
          We couldn&apos;t find this golf course.
        </p>
        <p className="text-text-muted mb-8">
          The course may have been removed or the link might be incorrect.
          Let&apos;s explore other great courses nearby.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/explore">
            <Button variant="primary" leftIcon={<MapIcon />}>
              Explore Courses
            </Button>
          </Link>
          <Link href="/feed">
            <Button variant="secondary" leftIcon={<FeedIcon />}>
              Browse Tee Times
            </Button>
          </Link>
        </div>

        {/* Popular Courses Section */}
        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-sm text-text-muted mb-3">Looking for something specific?</p>
          <p className="text-sm text-text-secondary">
            Use the{' '}
            <Link href="/explore" className="text-primary hover:text-primary-600 underline underline-offset-2">
              course map
            </Link>
            {' '}to find courses in your area.
          </p>
        </div>
      </div>
    </div>
  );
}

// Missing Course (Empty Map with Pin) SVG
function MissingCourseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Map outline */}
      <rect x="20" y="25" width="88" height="70" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />

      {/* Map fold lines */}
      <line x1="49" y1="25" x2="49" y2="95" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="79" y1="25" x2="79" y2="95" stroke="currentColor" strokeWidth="1" opacity="0.2" />

      {/* Faded map details - suggesting empty content */}
      <path d="M30 45 Q45 50, 60 42 T90 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.15" />
      <path d="M30 60 Q50 55, 70 65 T100 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.15" />
      <path d="M30 75 Q55 80, 80 72 T100 78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.15" />

      {/* Location pin with question mark */}
      <path
        d="M64 30 C50 30, 42 42, 42 54 C42 70, 64 85, 64 85 C64 85, 86 70, 86 54 C86 42, 78 30, 64 30 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Question mark inside pin */}
      <path
        d="M64 42 Q72 42, 72 50 Q72 56, 64 58"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <circle cx="64" cy="66" r="2.5" fill="currentColor" fillOpacity="0.6" />

      {/* Dotted search radius */}
      <circle
        cx="64"
        cy="55"
        r="35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        fill="none"
        opacity="0.3"
      />

      {/* Small X marks where course should be */}
      <g opacity="0.3">
        <line x1="30" y1="48" x2="36" y2="54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36" y1="48" x2="30" y2="54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.3">
        <line x1="92" y1="62" x2="98" y2="68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="98" y1="62" x2="92" y2="68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Ground shadow */}
      <ellipse cx="64" cy="105" rx="30" ry="5" fill="currentColor" fillOpacity="0.1" />
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
