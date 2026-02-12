import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Tee Time Not Found Page
 * Displayed when a specific tee time doesn't exist
 */
export default function TeeTimeNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[60vh]">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Empty Tee Box Illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <EmptyTeeBoxIcon className="w-full h-full text-primary/20" />
        </div>

        {/* Error Badge */}
        <div className="inline-flex items-center justify-center px-3 py-1 mb-5 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-xs font-semibold text-accent tracking-wide">TEE TIME NOT FOUND</span>
        </div>

        {/* Error Heading */}
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
          Tee Time Unavailable
        </h2>

        {/* Error Message */}
        <p className="text-text-secondary mb-2">
          This tee time no longer exists.
        </p>
        <p className="text-text-muted mb-8">
          It may have been cancelled, filled, or the date has passed.
          Let&apos;s find you another great round.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/feed">
            <Button variant="primary" leftIcon={<SearchIcon />}>
              Find Tee Times
            </Button>
          </Link>
          <Link href="/my-times">
            <Button variant="secondary" leftIcon={<CalendarIcon />}>
              My Bookings
            </Button>
          </Link>
        </div>

        {/* Additional Options */}
        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-sm text-text-muted mb-3">Looking for something specific?</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            <Link href="/explore" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              Explore Courses
            </Link>
            <span className="text-text-muted">|</span>
            <Link href="/messages" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              Contact Host
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty Tee Box SVG
function EmptyTeeBoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tee markers */}
      <rect x="25" y="70" width="8" height="30" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="95" y="70" width="8" height="30" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />

      {/* Tee box outline */}
      <rect x="20" y="95" width="88" height="8" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />

      {/* Golf tee (empty, no ball) */}
      <path
        d="M64 80 L64 95"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 80 Q64 76, 68 80"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Dotted circle showing where ball should be */}
      <circle
        cx="64"
        cy="65"
        r="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.4"
      />

      {/* Question mark in center */}
      <path
        d="M64 56 Q68 56, 68 60 Q68 64, 64 66"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <circle cx="64" cy="72" r="1.5" fill="currentColor" fillOpacity="0.5" />

      {/* Small arrows pointing to empty spot */}
      <path d="M45 50 L55 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M83 50 L73 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

      {/* Ground/grass */}
      <path
        d="M10 108 Q64 102, 118 108"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />

      {/* Grass blades */}
      <path d="M15 108 Q18 100, 16 108" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M112 108 Q115 98, 113 108" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
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

// Calendar Icon
function CalendarIcon({ className }: { className?: string }) {
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
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
      />
    </svg>
  );
}
