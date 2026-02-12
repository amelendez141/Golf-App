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
          'relative transition-transform duration-200',
          isSelected && 'scale-125 z-10',
          !isSelected && 'hover:scale-110'
        )}
        aria-label={`${marker.course.name} - ${marker.openSlots} open slots`}
      >
        {/* Pin body */}
        <div
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 rounded-full shadow-lg',
            'border-2',
            hasOpenSlots
              ? 'bg-primary border-white'
              : 'bg-gray-400 border-gray-200'
          )}
        >
          <GolfIcon
            className={cn(
              'h-5 w-5',
              hasOpenSlots ? 'text-white' : 'text-gray-200'
            )}
          />
        </div>

        {/* Pin point */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 -bottom-1',
            'w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px]',
            'border-l-transparent border-r-transparent',
            hasOpenSlots ? 'border-t-primary' : 'border-t-gray-400'
          )}
        />

        {/* Open slots badge */}
        {hasOpenSlots && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold shadow-md">
            {marker.openSlots}
          </div>
        )}

        {/* Pulse animation for open slots */}
        {hasOpenSlots && (
          <div className="absolute inset-0 -z-10">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30" />
          </div>
        )}
      </button>
    </Marker>
  );
}

function GolfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
