'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type TabType = 'upcoming' | 'hosted' | 'past';

export default function MyTimesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

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
            { id: 'upcoming' as TabType, label: 'Upcoming' },
            { id: 'hosted' as TabType, label: 'Hosted' },
            { id: 'past' as TabType, label: 'Past' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium rounded-md transition-colors z-10',
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
            {activeTab === 'upcoming' && <UpcomingTeeTimes />}
            {activeTab === 'hosted' && <HostedTeeTimes />}
            {activeTab === 'past' && <PastTeeTimes />}
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
}

function UpcomingTeeTimes() {
  // Mock empty state
  return (
    <EmptyState
      icon={<CalendarIcon className="h-12 w-12" />}
      title="No upcoming tee times"
      description="You haven't joined any tee times yet. Browse the feed to find groups to play with."
      action={
        <Link href="/feed">
          <Button>Browse Tee Times</Button>
        </Link>
      }
    />
  );
}

function HostedTeeTimes() {
  return (
    <EmptyState
      icon={<GolfIcon className="h-12 w-12" />}
      title="No hosted tee times"
      description="You haven't posted any tee times yet. Create one to find playing partners."
      action={
        <Link href="/post">
          <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
            Post Tee Time
          </Button>
        </Link>
      }
    />
  );
}

function PastTeeTimes() {
  return (
    <EmptyState
      icon={<ClockIcon className="h-12 w-12" />}
      title="No past rounds"
      description="Your completed rounds will appear here. Start by joining a tee time!"
    />
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
