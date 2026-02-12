'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  });

  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

interface AnimatedStatsCounterProps {
  stats?: {
    users: number;
    teeTimes: number;
    courses: number;
    connections: number;
  };
  variant?: 'horizontal' | 'grid';
  className?: string;
}

const defaultStats = {
  users: 2547,
  teeTimes: 12893,
  courses: 847,
  connections: 8421,
};

export function AnimatedStatsCounter({
  stats = defaultStats,
  variant = 'horizontal',
  className,
}: AnimatedStatsCounterProps) {
  const statItems: StatItem[] = [
    {
      label: 'Active Golfers',
      value: stats.users,
      suffix: '+',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Tee Times Booked',
      value: stats.teeTimes,
      suffix: '+',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: 'bg-accent/10 text-accent',
    },
    {
      label: 'Partner Courses',
      value: stats.courses,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Connections Made',
      value: stats.connections,
      suffix: '+',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div
      className={cn(
        variant === 'horizontal'
          ? 'flex flex-wrap items-center justify-center gap-4 lg:gap-8'
          : 'grid grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl bg-card shadow-card',
            variant === 'grid' && 'flex-col text-center'
          )}
        >
          <div className={cn('p-2.5 rounded-xl', stat.color)}>
            {stat.icon}
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-primary font-serif">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </p>
            <p className="text-xs lg:text-sm text-text-muted">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Compact inline version for the demo banner
export function InlineStatsCounter({
  stats = defaultStats,
  className,
}: {
  stats?: typeof defaultStats;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [counters, setCounters] = useState({ users: 0, teeTimes: 0, courses: 0 });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setCounters({
        users: Math.round(stats.users * eased),
        teeTimes: Math.round(stats.teeTimes * eased),
        courses: Math.round(stats.courses * eased),
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isInView, stats]);

  return (
    <div ref={ref} className={cn('flex items-center gap-4 text-sm', className)}>
      <span className="flex items-center gap-1.5">
        <span className="font-semibold">{counters.users.toLocaleString()}</span>
        <span className="text-white/70">professionals</span>
      </span>
      <span className="text-white/40">|</span>
      <span className="flex items-center gap-1.5">
        <span className="font-semibold">{counters.courses.toLocaleString()}</span>
        <span className="text-white/70">courses</span>
      </span>
      <span className="text-white/40">|</span>
      <span className="flex items-center gap-1.5">
        <span className="font-semibold">{counters.teeTimes.toLocaleString()}</span>
        <span className="text-white/70">tee times</span>
      </span>
    </div>
  );
}
