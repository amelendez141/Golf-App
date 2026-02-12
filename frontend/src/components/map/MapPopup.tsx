'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Popup } from 'react-map-gl';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { PRICE_LEVEL_LABELS, COURSE_TYPES } from '@/lib/constants';
import type { MapMarker } from '@/lib/types';

interface MapPopupProps {
  marker: MapMarker;
  onClose: () => void;
}

export function MapPopup({ marker, onClose }: MapPopupProps) {
  const { course, openSlots, teeTimeCount } = marker;

  return (
    <Popup
      longitude={marker.lng}
      latitude={marker.lat}
      anchor="bottom"
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      className="course-popup"
      offset={[0, -45] as [number, number]}
    >
      <div className="w-72 bg-card rounded-xl shadow-xl overflow-hidden">
        {/* Course Image */}
        <div className="relative h-32">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>

          {/* Course name */}
          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="text-sm font-serif font-semibold text-white line-clamp-1">
              {course.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Info row */}
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span>{course.city}, {course.state}</span>
            <span className="text-primary/20">•</span>
            <span>{COURSE_TYPES[course.courseType]}</span>
            <span className="text-primary/20">•</span>
            <span>{PRICE_LEVEL_LABELS[course.priceLevel]}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'h-2 w-2 rounded-full',
                openSlots > 0 ? 'bg-success' : 'bg-gray-300'
              )} />
              <span className="text-xs font-medium">
                {teeTimeCount} tee {teeTimeCount === 1 ? 'time' : 'times'}
              </span>
            </div>
            {openSlots > 0 && (
              <Badge variant="success" size="sm">
                {openSlots} {openSlots === 1 ? 'spot' : 'spots'} open
              </Badge>
            )}
          </div>

          {/* Rating */}
          {course.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
              <span className="text-xs text-text-muted">
                ({course.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Action */}
          <Link href={`/course/${course.slug}`}>
            <Button variant="secondary" size="sm" fullWidth>
              View Course
            </Button>
          </Link>
        </div>
      </div>
    </Popup>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  );
}
