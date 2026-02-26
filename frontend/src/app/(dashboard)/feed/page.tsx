'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { TeeTimeCard } from '@/components/feed/TeeTimeCard';
import { TeeTimeCardSkeletonList } from '@/components/feed/TeeTimeCardSkeleton';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { EmptyFeed } from '@/components/feed/EmptyFeed';
import { useTeeTimeFeed } from '@/hooks/useTeeTimeFeed';
import { useJoinTeeTime } from '@/hooks/useJoinTeeTime';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useFeedStore } from '@/lib/stores/feedStore';
import { useToast } from '@/components/ui/Toast';
import { StaggerList, StaggerItem, Confetti, useCelebration } from '@/components/animations';
import { QuickMatchCard } from '@/components/match';
import { cn } from '@/lib/utils';

export default function FeedPage() {
  const { filters } = useFeedStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isActive: showConfetti, origin, celebrate, reset } = useCelebration();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useTeeTimeFeed(filters);

  const joinMutation = useJoinTeeTime();

  // WebSocket for real-time updates (disabled - server not configured)
  useWebSocket({
    enabled: false,
    onNewTeeTime: () => {
      refetch();
    },
    onSlotFilled: () => {
      refetch();
    },
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleJoin = useCallback(
    async (teeTimeId: string, slotNumber: number, event?: React.MouseEvent) => {
      try {
        await joinMutation.mutateAsync({ teeTimeId, slotNumber });
        // Trigger celebration animation on success
        if (event) {
          celebrate(event);
        } else {
          celebrate();
        }
        toast.success('Joined!', 'You have successfully joined the tee time.');
      } catch (error: unknown) {
        const message = (error as { error?: { message?: string } })?.error?.message || 'Failed to join tee time';
        toast.error('Could not join', message);
      }
    },
    [joinMutation, toast, celebrate]
  );

  const teeTimes = data?.pages.flatMap((page) => page.data) || [];
  const isEmpty = !isLoading && teeTimes.length === 0;

  return (
    <div className="py-4 sm:py-6 pb-24 sm:pb-6">
      <Container>
        {/* Header - Better mobile typography */}
        <div className="mb-4 sm:mb-6">
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">
            Tee Times
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Find open tee times and join groups of like-minded professionals.
          </p>
        </div>

        {/* Quick Match */}
        <QuickMatchCard className="mb-4 sm:mb-6" />

        {/* Filters */}
        <FeedFilters className="mb-4 sm:mb-6" />

        {/* Content */}
        {isLoading ? (
          <TeeTimeCardSkeletonList count={6} />
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">Failed to load tee times</p>
            <button
              onClick={() => refetch()}
              className="text-accent hover:text-accent-600 font-medium"
            >
              Try again
            </button>
          </div>
        ) : isEmpty ? (
          <EmptyFeed />
        ) : (
          <>
            {/* Confetti celebration on successful join */}
            <Confetti
              active={showConfetti}
              onComplete={reset}
              originX={origin.x}
              originY={origin.y}
              particleCount={40}
            />

            <StaggerList className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {teeTimes.map((teeTime) => (
                <StaggerItem key={teeTime.id}>
                  <TeeTimeCard
                    teeTime={teeTime}
                    onJoin={handleJoin}
                    isJoining={
                      joinMutation.isPending &&
                      joinMutation.variables?.teeTimeId === teeTime.id
                    }
                  />
                </StaggerItem>
              ))}
            </StaggerList>

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-text-muted">
                  <LoadingSpinner />
                  <span>Loading more...</span>
                </div>
              )}
              {!hasNextPage && teeTimes.length > 0 && (
                <p className="text-text-muted text-sm">
                  You&apos;ve seen all available tee times
                </p>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-accent"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
// Force rebuild Tue Feb 17 16:34:56 EST 2026
