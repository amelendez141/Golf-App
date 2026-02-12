import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Dashboard 404 Not Found Page
 * Displayed when a user navigates to a non-existent dashboard route
 */
export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[60vh]">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Lost on Course Illustration */}
        <div className="relative w-36 h-36 mx-auto mb-8">
          <LostOnCourseIcon className="w-full h-full text-primary/20" />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center justify-center px-3 py-1 mb-5 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-xs font-semibold text-accent tracking-wide">PAGE NOT FOUND</span>
        </div>

        {/* Error Heading */}
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
          Wrong Fairway
        </h2>

        {/* Error Message */}
        <p className="text-text-secondary mb-2">
          This page doesn&apos;t exist in our course layout.
        </p>
        <p className="text-text-muted mb-8">
          No worries, let&apos;s get you back to familiar ground.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/feed">
            <Button variant="primary" leftIcon={<FeedIcon />}>
              Go to Feed
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="secondary" leftIcon={<CompassIcon />}>
              Explore
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-sm text-text-muted mb-3">Quick links:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            <Link href="/my-times" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              My Tee Times
            </Link>
            <Link href="/messages" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              Messages
            </Link>
            <Link href="/profile" className="text-sm text-primary hover:text-primary-600 underline underline-offset-2">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lost on Course (Golfer with Map) SVG
function LostOnCourseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Course map */}
      <rect x="50" y="50" width="44" height="54" rx="3" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />

      {/* Map folds */}
      <line x1="72" y1="50" x2="72" y2="104" stroke="currentColor" strokeWidth="1" opacity="0.3" />

      {/* Map content - paths */}
      <path d="M56 62 Q62 68, 68 66 T80 70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M58 78 Q66 82, 74 76 T88 80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Flag markers on map */}
      <circle cx="60" cy="70" r="2.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="84" cy="86" r="2.5" fill="currentColor" fillOpacity="0.4" />

      {/* "You are here" dot with pulse */}
      <circle cx="72" cy="78" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="72" cy="78" r="2" fill="currentColor" fillOpacity="0.6" />

      {/* Question marks around */}
      <text x="30" y="45" fill="currentColor" opacity="0.5" fontSize="16" fontWeight="bold">?</text>
      <text x="108" y="55" fill="currentColor" opacity="0.4" fontSize="14" fontWeight="bold">?</text>
      <text x="25" y="95" fill="currentColor" opacity="0.3" fontSize="12" fontWeight="bold">?</text>
      <text x="115" y="90" fill="currentColor" opacity="0.35" fontSize="13" fontWeight="bold">?</text>

      {/* Compass rose - simplified */}
      <circle cx="72" cy="30" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M72 20 L72 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M72 36 L72 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M62 30 L66 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M78 30 L82 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <text x="69" y="24" fill="currentColor" opacity="0.5" fontSize="6" fontWeight="bold">N</text>

      {/* Arrows showing confusion */}
      <path d="M36 70 L26 65 M36 70 L26 75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M108 70 L118 65 M108 70 L118 75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* Ground */}
      <path
        d="M20 125 Q72 118, 124 125"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />

      {/* Small grass tufts */}
      <path d="M40 125 Q42 118, 44 125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M100 125 Q102 116, 104 125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
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

// Compass Icon
function CompassIcon({ className }: { className?: string }) {
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
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 0v1.5m0 18v-1.5m9.75-9.75h-1.5m-18 0h1.5m15.364-6.364l-1.06 1.06m-12.728 0l1.06-1.06m12.728 12.728l-1.06-1.06m-12.728 0l1.06 1.06M12 7.5l1.81 4.08L18 13.5l-4.19 1.81L12 19.5l-1.81-4.19L6 13.5l4.19-1.92L12 7.5z"
      />
    </svg>
  );
}
