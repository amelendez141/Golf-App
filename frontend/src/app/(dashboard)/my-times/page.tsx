'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { TeeTime } from '@/lib/types';

type TabType = 'upcoming' | 'hosted' | 'past';

export default function MyTimesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [allTeeTimes, setAllTeeTimes] = useState<TeeTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, token } = useAuth();

  // Fetch all tee times once
  useEffect(() => {
    async function fetchTeeTimes() {
      if (!isAuthenticated || !token || !user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.getUserTeeTimes();
        if (response.success && response.data) {
          setAllTeeTimes(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch tee times:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeeTimes();
  }, [user, isAuthenticated, token]);

  // Memoized filtered lists
  const now = new Date();

  const upcomingTeeTimes = useMemo(() => {
    return allTeeTimes.filter(tt => {
      const teeTimeDate = new Date(tt.dateTime);
      const isUpcoming = teeTimeDate > now;
      const isHost = tt.host?.id === user?.id;
      const hasJoined = tt.slots?.some(slot => slot.user?.id === user?.id);
      return isUpcoming && (isHost || hasJoined);
    });
  }, [allTeeTimes, user?.id, now]);

  const hostedTeeTimes = useMemo(() => {
    return allTeeTimes.filter(tt => {
      const teeTimeDate = new Date(tt.dateTime);
      const isHost = tt.host?.id === user?.id;
      const isFuture = teeTimeDate > now;
      return isHost && isFuture;
    });
  }, [allTeeTimes, user?.id, now]);

  const pastTeeTimes = useMemo(() => {
    return allTeeTimes.filter(tt => {
      const teeTimeDate = new Date(tt.dateTime);
      return teeTimeDate <= now;
    });
  }, [allTeeTimes, now]);

  // Get counts for badges
  const counts = {
    upcoming: upcomingTeeTimes.length,
    hosted: hostedTeeTimes.length,
    past: pastTeeTimes.length,
  };

  return (
    <div className="py-6">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
              My Tee Times
            </h1>
            <p className="text-text-secondary">
              Manage your upcoming rounds and view your history.
            </p>
          </div>
          <Link href="/post">
            <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
              Post Tee Time
            </Button>
          </Link>
        </div>

        {/* Tabs with animated indicator */}
        <div className="flex gap-1 p-1 bg-secondary-200 rounded-lg w-fit mb-6 relative">
          {[
            { id: 'upcoming' as TabType, label: 'Upcoming', count: counts.upcoming },
            { id: 'hosted' as TabType, label: 'Hosted', count: counts.hosted },
            { id: 'past' as TabType, label: 'Past', count: counts.past },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium rounded-md transition-colors z-10 flex items-center gap-2',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-text-muted hover:text-primary'
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-card rounded-md shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  "relative z-10 text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.id
                    ? "bg-accent text-white"
                    : "bg-secondary-300 text-text-muted"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content with animated tab transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'upcoming' && (
              <TeeTimeList
                teeTimes={upcomingTeeTimes}
                isLoading={isLoading}
                emptyIcon={<CalendarIcon className="h-12 w-12" />}
                emptyTitle="No upcoming tee times"
                emptyDescription="You haven't joined any tee times yet. Browse the feed to find groups to play with."
                emptyAction={
                  <Link href="/feed">
                    <Button>Browse Tee Times</Button>
                  </Link>
                }
              />
            )}
            {activeTab === 'hosted' && (
              <TeeTimeList
                teeTimes={hostedTeeTimes}
                isLoading={isLoading}
                isHosted
                emptyIcon={<GolfIcon className="h-12 w-12" />}
                emptyTitle="No hosted tee times"
                emptyDescription="You haven't posted any tee times yet. Create one to find playing partners."
                emptyAction={
                  <Link href="/post">
                    <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
                      Post Tee Time
                    </Button>
                  </Link>
                }
              />
            )}
            {activeTab === 'past' && (
              <TeeTimeList
                teeTimes={pastTeeTimes}
                isLoading={isLoading}
                isPast
                emptyIcon={<ClockIcon className="h-12 w-12" />}
                emptyTitle="No past rounds"
                emptyDescription="Your completed rounds will appear here. Start by joining a tee time!"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
}

function TeeTimeList({
  teeTimes,
  isLoading,
  isHosted,
  isPast,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  teeTimes: TeeTime[];
  isLoading: boolean;
  isHosted?: boolean;
  isPast?: boolean;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (teeTimes.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {teeTimes.map((teeTime) => (
        <TeeTimeCard
          key={teeTime.id}
          teeTime={teeTime}
          isHosted={isHosted}
          isPast={isPast}
        />
      ))}
    </div>
  );
}

function TeeTimeCard({ teeTime, isHosted, isPast }: { teeTime: TeeTime; isHosted?: boolean; isPast?: boolean }) {
  const dateTime = new Date(teeTime.dateTime);
  const filledSlots = teeTime.slots?.filter(s => s.user).length || 0;

  return (
    <Link href={`/tee-time/${teeTime.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex gap-4">
          {/* Course Image */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {teeTime.course?.imageUrl ? (
              <Image
                src={teeTime.course.imageUrl}
                alt={teeTime.course.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <GolfIcon className="h-8 w-8 text-primary/40" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-primary truncate">
                  {teeTime.course?.name}
                </h3>
                <p className="text-sm text-text-muted">
                  {teeTime.course?.city}, {teeTime.course?.state}
                </p>
              </div>
              {isHosted && (
                <Badge variant="accent" size="sm">Host</Badge>
              )}
              {isPast && (
                <Badge variant="secondary" size="sm">Completed</Badge>
              )}
            </div>

            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-text-secondary">
                {dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-text-secondary">
                {dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className="text-text-muted">
                {filledSlots}/{teeTime.totalSlots} players
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg bg-primary/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-primary/10 rounded w-3/4" />
              <div className="h-4 bg-primary/10 rounded w-1/2" />
              <div className="h-4 bg-primary/10 rounded w-1/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
    >
      <Card className="py-12">
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="text-primary/20 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
          >
            {icon}
          </motion.div>
          <motion.h3
            className="font-serif text-lg font-semibold text-primary mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {title}
          </motion.h3>
          <motion.p
            className="text-text-muted max-w-md mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
          {action && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              {action}
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function GolfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
