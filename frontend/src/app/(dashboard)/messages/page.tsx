'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { TeeTime } from '@/lib/types';

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeeTimes() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getUserTeeTimes();
        if (response.success && response.data) {
          // Filter to upcoming tee times only (active conversations)
          const now = new Date();
          const upcoming = response.data.filter(tt => new Date(tt.dateTime) > now);
          setTeeTimes(upcoming);
        }
      } catch (err) {
        console.error('Failed to fetch tee times:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeeTimes();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="py-6">
        <Container>
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
              Messages
            </h1>
            <p className="text-text-secondary">
              Connect with your playing partners.
            </p>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-primary/10 rounded w-2/3" />
                    <div className="h-3 bg-primary/10 rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6">
      <Container>
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
            Messages
          </h1>
          <p className="text-text-secondary">
            Connect with your playing partners.
          </p>
        </div>

        {teeTimes.length === 0 ? (
          /* Empty State */
          <Card className="py-12">
            <div className="flex flex-col items-center text-center">
              <div className="text-primary/20 mb-4">
                <MessageIcon className="h-12 w-12" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                No conversations yet
              </h3>
              <p className="text-text-muted max-w-md mb-6">
                When you join tee times, you'll be able to chat with your playing partners here.
              </p>
              <Link href="/feed">
                <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Browse Tee Times
                </button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Conversation List */
          <div className="space-y-3">
            {teeTimes.map((teeTime) => (
              <ConversationCard key={teeTime.id} teeTime={teeTime} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

function ConversationCard({ teeTime, currentUserId }: { teeTime: TeeTime; currentUserId?: string }) {
  const dateTime = new Date(teeTime.dateTime);
  const participants = teeTime.slots?.filter(s => s.user).map(s => s.user!) || [];
  const otherParticipants = participants.filter(p => p.id !== currentUserId);

  return (
    <Link href={`/tee-time/${teeTime.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex gap-4">
          {/* Course Image or Participant Avatars */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
            {teeTime.course?.imageUrl ? (
              <Image
                src={teeTime.course.imageUrl}
                alt={teeTime.course.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GolfIcon className="h-6 w-6 text-primary/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-primary truncate">
                {teeTime.course?.name}
              </h3>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <p className="text-sm text-text-muted truncate">
              {dateTime.toLocaleDateString('en-US', { weekday: 'short' })} at{' '}
              {dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>

            {/* Participants */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                {otherParticipants.slice(0, 3).map((participant) => (
                  <Avatar
                    key={participant.id}
                    src={participant.avatarUrl}
                    firstName={participant.firstName}
                    lastName={participant.lastName}
                    size="xs"
                    className="ring-2 ring-card"
                  />
                ))}
              </div>
              <span className="text-xs text-text-muted">
                {participants.length} {participants.length === 1 ? 'player' : 'players'}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center text-text-muted">
            <ChevronRightIcon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function MessageIcon({ className }: { className?: string }) {
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
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
