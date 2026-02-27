'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { cn, formatSmartDate, getFirstOpenSlotNumber } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IndustryBadge, SkillBadge, Badge } from '@/components/ui/Badge';
import { VisualSlotIndicator } from './SlotIndicator';
import { HostMiniCard } from './HostMiniCard';
import type { TeeTime } from '@/lib/types';

interface TeeTimeCardProps {
  teeTime: TeeTime;
  onJoin?: (teeTimeId: string, slotNumber: number, event?: React.MouseEvent) => void;
  isJoining?: boolean;
  className?: string;
}

// Simple weather fetch for card
async function fetchWeather(lat: number, lng: number) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/api/weather?latitude=${lat}&longitude=${lng}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.data;
}

export function TeeTimeCard({
  teeTime,
  onJoin,
  isJoining = false,
  className,
}: TeeTimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasOpenSlots = teeTime.availableSlots > 0;
  const filledSlots = teeTime.totalSlots - teeTime.availableSlots;

  const firstOpenSlot = getFirstOpenSlotNumber(teeTime.slots);

  // Fetch weather for this course location
  const { data: weather } = useQuery({
    queryKey: ['weather-card', teeTime.course.latitude, teeTime.course.longitude],
    queryFn: () => fetchWeather(teeTime.course.latitude, teeTime.course.longitude),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!teeTime.course.latitude && !!teeTime.course.longitude,
  });

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstOpenSlot && onJoin) {
      onJoin(teeTime.id, firstOpenSlot, e);
    }
  };

  // Calculate distance if available
  const distance = teeTime.course.distance;

  return (
    <Link href={`/tee-time/${teeTime.id}`} className="block touch-manipulation">
      <Card
        variant="interactive"
        padding="none"
        className={cn('overflow-hidden active:scale-[0.99] transition-transform', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Weather Strip - Top */}
        {weather && (
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-gradient-to-r from-accent/[0.08] to-accent/[0.03] border-b border-accent/10">
            <div className="flex items-center gap-2.5">
              <WeatherIcon icon={weather.icon} className="h-5 w-5 text-accent" />
              <span className="text-sm font-semibold text-primary tracking-tight">{weather.temperature}°F</span>
              <span className="text-xs text-text-muted hidden xs:inline">{weather.conditions}</span>
            </div>
            {weather.playabilityScore >= 7 && (
              <Badge variant="success" size="sm">Great for golf</Badge>
            )}
          </div>
        )}

        {/* Course Image Header - Taller on mobile for better visuals */}
        <div className="relative h-36 sm:h-32 overflow-hidden">
          {teeTime.course.imageUrl ? (
            <img
              src={teeTime.course.imageUrl}
              alt={teeTime.course.name}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-transform duration-500',
                isHovered && 'scale-105'
              )}
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <GolfIcon className="h-12 w-12 text-primary/20" />
            </div>
          )}

          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />

          {/* Course name and location overlay */}
          <div className="absolute bottom-3 left-3.5 right-3.5">
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-1 tracking-tight">
                  {teeTime.course.name}
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  {teeTime.course.city}, {teeTime.course.state}
                </p>
              </div>
              {distance !== undefined && distance !== null && (
                <span className="shrink-0 text-[11px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                  {distance.toFixed(1)} mi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Body - Better mobile spacing */}
        <div className="p-3 sm:p-4 space-y-3">
          {/* Date/Time Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900 text-sm">
                {formatSmartDate(teeTime.dateTime)}
              </span>
            </div>
          </div>

          {/* Visual Slot Indicator - New design with circles */}
          <VisualSlotIndicator
            slots={teeTime.slots}
            totalSlots={teeTime.totalSlots}
            hostId={teeTime.host.id}
          />

          {/* Slots status text */}
          <p className="text-sm text-gray-500">
            {filledSlots}/{teeTime.totalSlots} joined
            {hasOpenSlots && (
              <span className="text-emerald-600 ml-1">
                • {teeTime.availableSlots} {teeTime.availableSlots === 1 ? 'spot' : 'spots'} open
              </span>
            )}
          </p>

          {/* Preferences - Compact with horizontal scroll on mobile */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
              {teeTime.industryPreference?.slice(0, 2).map((industry) => (
                <IndustryBadge key={industry} industry={industry} size="sm" className="shrink-0" />
              ))}
              {teeTime.skillPreference?.slice(0, 1).map((skill) => (
                <SkillBadge key={skill} skillLevel={skill} size="sm" className="shrink-0" />
              ))}
            </div>
            {/* Price indicator (if available) */}
            {teeTime.course.greenFee && (
              <span className="text-xs text-gray-400 shrink-0">
                {'$'.repeat(Math.min(4, Math.ceil(teeTime.course.greenFee / 5000)))}
              </span>
            )}
          </div>

          {/* Single CTA Button - Larger touch target */}
          {hasOpenSlots && onJoin && (
            <Button
              variant="accent"
              fullWidth
              size="lg"
              onClick={handleJoinClick}
              isLoading={isJoining}
              className="mt-1"
            >
              Join This Group
            </Button>
          )}

          {!hasOpenSlots && (
            <Button variant="secondary" fullWidth size="lg" disabled className="mt-1">
              Group Full
            </Button>
          )}
        </div>
      </Card>
    </Link>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function GolfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'sun':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      );
    case 'cloud-rain':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19.5v2m3-2v2m3-2v2" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
  }
}
