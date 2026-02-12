'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDemoStore } from '@/lib/stores/demoStore';

// Fake activity data for demo
const COURSES = [
  'Pebble Beach Golf Links',
  'Augusta National',
  'St Andrews Links',
  'Pinehurst No. 2',
  'TPC Sawgrass',
  'Bethpage Black',
  'Torrey Pines',
  'Whistling Straits',
  'Kiawah Island',
  'Bandon Dunes',
];

const FIRST_NAMES = [
  'John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley',
  'Robert', 'Amanda', 'William', 'Melissa', 'Chris', 'Jennifer', 'Daniel', 'Nicole',
];

const LAST_INITIALS = ['S', 'M', 'J', 'W', 'B', 'T', 'R', 'K', 'L', 'D'];

const INDUSTRIES = [
  'Finance', 'Technology', 'Healthcare', 'Legal', 'Real Estate', 'Consulting',
];

type ActivityType = 'joined' | 'created' | 'message' | 'match';

interface Activity {
  id: string;
  type: ActivityType;
  name: string;
  course?: string;
  industry?: string;
  timestamp: number;
}

function generateActivity(): Activity {
  const types: ActivityType[] = ['joined', 'created', 'message', 'match'];
  const type = types[Math.floor(Math.random() * types.length)];
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
  const name = `${firstName} ${lastInitial}.`;
  const course = COURSES[Math.floor(Math.random() * COURSES.length)];
  const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];

  return {
    id: Math.random().toString(36).substring(2, 9),
    type,
    name,
    course,
    industry,
    timestamp: Date.now(),
  };
}

function getActivityMessage(activity: Activity): string {
  switch (activity.type) {
    case 'joined':
      return `${activity.name} joined a tee time at ${activity.course}`;
    case 'created':
      return `${activity.name} created a new tee time at ${activity.course}`;
    case 'message':
      return `${activity.name} sent a message to their foursome`;
    case 'match':
      return `${activity.name} matched with a ${activity.industry} professional`;
    default:
      return '';
  }
}

function getActivityIcon(type: ActivityType): React.ReactNode {
  switch (type) {
    case 'joined':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      );
    case 'created':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    case 'message':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
    case 'match':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      );
  }
}

function getActivityColor(type: ActivityType): string {
  switch (type) {
    case 'joined':
      return 'bg-success/10 text-success';
    case 'created':
      return 'bg-accent/10 text-accent';
    case 'message':
      return 'bg-primary/10 text-primary';
    case 'match':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function LiveActivityFeed() {
  const { isActivityFeedVisible, setActivityFeedVisible } = useDemoStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial activities
  useEffect(() => {
    const initial: Activity[] = [];
    for (let i = 0; i < 3; i++) {
      initial.push(generateActivity());
    }
    setActivities(initial);
  }, []);

  // Auto-generate new activities
  useEffect(() => {
    if (!isActivityFeedVisible || isMinimized) return;

    intervalRef.current = setInterval(() => {
      setActivities((prev) => {
        const newActivity = generateActivity();
        const updated = [newActivity, ...prev].slice(0, 5);
        return updated;
      });
    }, 4000 + Math.random() * 3000); // Random interval between 4-7 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActivityFeedVisible, isMinimized]);

  const handleClose = useCallback(() => {
    setActivityFeedVisible(false);
  }, [setActivityFeedVisible]);

  const handleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  if (!isActivityFeedVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className={cn(
        'fixed bottom-4 right-4 z-40 w-80 bg-card rounded-xl shadow-xl border border-primary/10 overflow-hidden',
        'max-h-[400px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/5 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-sm font-semibold text-primary">Live Activity</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="p-1.5 rounded-lg hover:bg-primary/5 transition-colors text-text-muted hover:text-primary"
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              )}
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-primary/5 transition-colors text-text-muted hover:text-primary"
            aria-label="Close activity feed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Activity list */}
      <AnimatePresence mode="popLayout">
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-primary/5 max-h-[300px] overflow-y-auto"
          >
            <AnimatePresence mode="popLayout">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, x: 50, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  transition={{ type: 'spring', duration: 0.4 }}
                  className="px-4 py-3 hover:bg-primary/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text leading-snug">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-text-muted mt-1">Just now</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {!isMinimized && (
        <div className="px-4 py-2 border-t border-primary/5 bg-primary/[0.02]">
          <p className="text-xs text-text-muted text-center">
            Real-time updates from demo users
          </p>
        </div>
      )}
    </motion.div>
  );
}
