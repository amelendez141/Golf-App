import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Root 404 Not Found Page
 * Displayed when a user navigates to a non-existent route
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto text-center">
        {/* Out of Bounds Illustration */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <OutOfBoundsIcon className="w-full h-full text-primary/20" />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-sm font-semibold text-accent tracking-wide">404</span>
        </div>

        {/* Error Heading */}
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-4">
          Out of Bounds
        </h1>

        {/* Error Message */}
        <p className="text-text-secondary text-lg mb-2">
          Looks like your shot went a little too far.
        </p>
        <p className="text-text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back in play.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/feed">
            <Button variant="primary" size="lg" leftIcon={<HomeIcon />}>
              Go to Feed
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="secondary" size="lg" leftIcon={<MapIcon />}>
              Explore Courses
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-8 border-t border-primary/10">
          <p className="text-sm text-text-muted mb-4">Popular destinations:</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/feed" className="text-sm text-primary hover:text-primary-600 hover:underline underline-offset-2 transition-colors">
              Browse Tee Times
            </Link>
            <Link href="/my-times" className="text-sm text-primary hover:text-primary-600 hover:underline underline-offset-2 transition-colors">
              My Bookings
            </Link>
            <Link href="/messages" className="text-sm text-primary hover:text-primary-600 hover:underline underline-offset-2 transition-colors">
              Messages
            </Link>
            <Link href="/profile" className="text-sm text-primary hover:text-primary-600 hover:underline underline-offset-2 transition-colors">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Out of Bounds Stakes & Ball SVG
function OutOfBoundsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* OB Stakes */}
      {/* Left stake */}
      <rect x="30" y="40" width="6" height="100" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      <rect x="28" y="40" width="10" height="20" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />

      {/* Right stake */}
      <rect x="156" y="50" width="6" height="90" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      <rect x="154" y="50" width="10" height="20" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />

      {/* OB line */}
      <path
        d="M36 60 L159 70"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="8 4"
        opacity="0.4"
      />

      {/* Golf ball outside bounds */}
      <circle cx="100" cy="100" r="18" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="92" cy="94" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="108" cy="94" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="100" cy="108" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="92" cy="106" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="108" cy="106" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="100" cy="92" r="3" fill="currentColor" fillOpacity="0.2" />

      {/* Ball trajectory arc */}
      <path
        d="M170 30 Q140 20, 105 85"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 6"
        fill="none"
        opacity="0.4"
      />

      {/* Impact star */}
      <circle cx="100" cy="100" r="24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" fill="none" opacity="0.3" />

      {/* Rough grass/weeds */}
      <path d="M60 150 Q65 130, 62 115" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M72 150 Q78 125, 74 105" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M120 150 Q115 128, 122 108" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M132 150 Q138 132, 134 118" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M85 155 Q80 140, 86 128" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M110 155 Q115 138, 108 125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Ground */}
      <path
        d="M20 160 Q50 155, 96 158 T172 160"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />

      {/* X mark indicating out of bounds */}
      <line x1="78" y1="80" x2="90" y2="92" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <line x1="90" y1="80" x2="78" y2="92" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
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

// Map Icon
function MapIcon({ className }: { className?: string }) {
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
        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
      />
    </svg>
  );
}
