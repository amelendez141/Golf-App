'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { getCurrentPosition, type GeolocationPosition } from '@/lib/geolocation';
import { api } from '@/lib/api';

interface QuickMatchCardProps {
  className?: string;
}

type TimeFilter = 'today' | 'tomorrow' | 'this-week';

export function QuickMatchCard({ className }: QuickMatchCardProps) {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [isExpanded, setIsExpanded] = useState(false);

  // Get user's location on mount
  useEffect(() => {
    async function fetchLocation() {
      setIsLoadingLocation(true);
      const result = await getCurrentPosition();

      if (result.success) {
        setLocation(result.position);
        setLocationError(null);
      } else {
        setLocationError(result.error.message);
        // Use default location (San Francisco) for demo
        setLocation({ latitude: 37.7749, longitude: -122.4194 });
      }
      setIsLoadingLocation(false);
    }

    fetchLocation();
  }, []);

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const fromDate = new Date(now);
    fromDate.setHours(0, 0, 0, 0);

    let toDate = new Date(fromDate);

    switch (timeFilter) {
      case 'today':
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'tomorrow':
        fromDate.setDate(fromDate.getDate() + 1);
        toDate = new Date(fromDate);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'this-week':
        toDate.setDate(toDate.getDate() + 7);
        break;
    }

    return {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    };
  };

  // Fetch recommended tee times
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['quickMatch', location?.latitude, location?.longitude, timeFilter],
    queryFn: async () => {
      if (!location) return { data: [], pagination: { hasMore: false } };

      const { fromDate, toDate } = getDateRange();
      const response = await api.getTeeTimes({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 25,
        fromDate,
        toDate,
        hasAvailableSlots: true,
        limit: 3,
      });
      return response;
    },
    enabled: !!location,
    staleTime: 60 * 1000, // 1 minute
  });

  const matchCount = data?.data?.length || 0;

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5',
        className
      )}
      padding="none"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <LightningIcon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-primary">Quick Match</h3>
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <LocationPinIcon className="h-3.5 w-3.5" />
              {isLoadingLocation ? (
                <span className="animate-pulse">Locating...</span>
              ) : locationError ? (
                <span>Default location</span>
              ) : (
                <span>Near you</span>
              )}
            </div>
          </div>
        </div>

        {/* Time filter chips */}
        <div className="flex gap-2">
          {(['today', 'tomorrow', 'this-week'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[36px]',
                timeFilter === filter
                  ? 'bg-accent text-white'
                  : 'bg-secondary hover:bg-secondary-300 text-text-secondary'
              )}
            >
              {filter === 'today' && 'Today'}
              {filter === 'tomorrow' && 'Tomorrow'}
              {filter === 'this-week' && 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pb-4">
        {isLoading || isLoadingLocation ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : matchCount > 0 ? (
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : '64px' }}
            className="overflow-hidden"
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-3 rounded-xl bg-success/10 hover:bg-success/15 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GolfIcon className="h-6 w-6 text-success" />
                  <div>
                    <span className="text-lg font-semibold text-success">{matchCount}</span>
                    <span className="text-text-secondary ml-1.5">
                      {matchCount === 1 ? 'match' : 'matches'} available
                    </span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronIcon className="h-5 w-5 text-text-muted" />
                </motion.div>
              </div>
            </button>

            {/* Expanded match list */}
            <AnimatePresence>
              {isExpanded && data?.data && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 space-y-2"
                >
                  {data.data.slice(0, 3).map((teeTime) => (
                    <Link key={teeTime.id} href={`/tee-time/${teeTime.id}`}>
                      <div className="p-3 rounded-lg bg-secondary hover:bg-secondary-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary text-sm line-clamp-1">
                              {teeTime.course.name}
                            </p>
                            <p className="text-xs text-text-muted">
                              {new Date(teeTime.dateTime).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                              {' • '}
                              {teeTime.availableSlots} {teeTime.availableSlots === 1 ? 'spot' : 'spots'}
                            </p>
                          </div>
                          <ArrowRightIcon className="h-4 w-4 text-text-muted" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="p-3 rounded-xl bg-secondary text-center">
            <p className="text-text-muted text-sm">No matches for {timeFilter.replace('-', ' ')}</p>
            <p className="text-xs text-text-muted mt-1">Try expanding your search</p>
          </div>
        )}

        {/* Browse all link */}
        <Link
          href={`/feed${location ? `?lat=${location.latitude}&lng=${location.longitude}` : ''}`}
          className="block mt-3"
        >
          <Button variant="outline" fullWidth size="sm">
            Browse all tee times
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function LightningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
