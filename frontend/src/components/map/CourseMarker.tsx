'use client';

import { Marker } from 'react-map-gl';
import { cn } from '@/lib/utils';
import type { MapMarker } from '@/lib/types';

interface CourseMarkerProps {
  marker: MapMarker;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CourseMarker({ marker, isSelected, onClick }: CourseMarkerProps) {
  const hasOpenSlots = marker.openSlots > 0;

  return (
    <Marker
      longitude={marker.lng}
      latitude={marker.lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.();
      }}
    >
      <button
        className={cn(
          'relative transition-all duration-300 ease-out',
          // Selected state with bounce effect
          isSelected && 'scale-125 z-10 -translate-y-1',
          // Hover state with smooth scale
          !isSelected && 'hover:scale-110 hover:-translate-y-0.5',
          // Drop shadow for depth
          'drop-shadow-lg'
        )}
        aria-label={`${marker.course.name} - ${marker.openSlots} open slots`}
      >
        {/* Outer glow for premium look */}
        {hasOpenSlots && isSelected && (
          <div className="absolute inset-0 -z-20 scale-150">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 blur-md" />
          </div>
        )}

        {/* Pin body with gradient */}
        <div
          className={cn(
            'flex items-center justify-center',
            'w-11 h-11 rounded-full',
            // Premium shadow layers
            'shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]',
            'border-2 border-white',
            // Gradient backgrounds for premium look
            hasOpenSlots
              ? 'bg-gradient-to-br from-primary via-primary to-primary/80'
              : 'bg-gradient-to-br from-gray-400 via-gray-400 to-gray-500'
          )}
        >
          <GolfFlagIcon
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              hasOpenSlots ? 'text-white' : 'text-gray-200',
              isSelected && 'scale-110'
            )}
          />
        </div>

        {/* Pin point with shadow */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 -bottom-1.5',
            'w-0 h-0 border-l-[7px] border-r-[7px] border-t-[10px]',
            'border-l-transparent border-r-transparent',
            'drop-shadow-sm',
            hasOpenSlots ? 'border-t-primary' : 'border-t-gray-400'
          )}
        />

        {/* Open slots badge with gradient */}
        {hasOpenSlots && (
          <div
            className={cn(
              'absolute -top-1.5 -right-1.5',
              'flex items-center justify-center',
              'min-w-[22px] h-[22px] px-1 rounded-full',
              'bg-gradient-to-br from-accent to-accent/80',
              'text-white text-xs font-bold',
              'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
              'border-2 border-white',
              // Subtle bounce animation
              isSelected && 'animate-bounce'
            )}
          >
            {marker.openSlots}
          </div>
        )}

        {/* Pulse animation ring for available courses */}
        {hasOpenSlots && !isSelected && (
          <div className="absolute inset-0 -z-10">
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full',
                'bg-primary opacity-40',
                'animate-ping'
              )}
              style={{ animationDuration: '2s' }}
            />
          </div>
        )}

        {/* Double pulse for selected state */}
        {hasOpenSlots && isSelected && (
          <>
            <div className="absolute inset-0 -z-10">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-30 animate-ping"
                style={{ animationDuration: '1.5s' }}
              />
            </div>
            <div className="absolute inset-0 -z-10">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-20 animate-ping"
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              />
            </div>
          </>
        )}
      </button>
    </Marker>
  );
}

/**
 * Golf flag icon for a more recognizable golf marker
 */
function GolfFlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {/* Flag pole */}
      <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Flag */}
      <path d="M12 4l7 4-7 4V4z" fill="currentColor" />
      {/* Hole/ground */}
      <ellipse cx="12" cy="22" rx="3" ry="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
