'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  courseName: string;
  address?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function DirectionsButton({
  latitude,
  longitude,
  courseName,
  address,
  className,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
}: DirectionsButtonProps) {
  const handleGetDirections = () => {
    // Detect platform and open appropriate maps app
    const destination = address
      ? encodeURIComponent(address)
      : `${latitude},${longitude}`;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let mapsUrl: string;

    if (isIOS) {
      // Apple Maps URL scheme
      mapsUrl = `maps://maps.apple.com/?daddr=${destination}&dirflg=d`;
    } else if (isAndroid) {
      // Google Maps intent for Android
      mapsUrl = `geo:${latitude},${longitude}?q=${destination}`;
    } else {
      // Fallback to Google Maps web
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    }

    // Try to open native app, fallback to web
    const opened = window.open(mapsUrl, '_blank');

    // If popup was blocked or failed, try Google Maps web as fallback
    if (!opened && !isIOS && !isAndroid) {
      window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleGetDirections}
      leftIcon={<DirectionsIcon className="h-4 w-4" />}
      className={cn(className)}
    >
      Get Directions
    </Button>
  );
}

function DirectionsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
