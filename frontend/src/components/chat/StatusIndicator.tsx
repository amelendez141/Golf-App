'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type PlayerStatus = 'on-way' | 'here' | 'ready' | 'playing' | 'offline';

interface StatusIndicatorProps {
  status: PlayerStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<PlayerStatus, { color: string; label: string; animate: boolean }> = {
  'on-way': {
    color: 'bg-warning',
    label: 'On the way',
    animate: true,
  },
  'here': {
    color: 'bg-success',
    label: 'At course',
    animate: false,
  },
  'ready': {
    color: 'bg-accent',
    label: 'Ready to play',
    animate: true,
  },
  'playing': {
    color: 'bg-primary',
    label: 'Playing',
    animate: false,
  },
  'offline': {
    color: 'bg-text-muted',
    label: 'Offline',
    animate: false,
  },
};

export function StatusIndicator({
  status,
  showLabel = false,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex">
        {config.animate && (
          <motion.span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              config.color
            )}
            animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span className={cn('relative inline-flex rounded-full', config.color, sizeClasses[size])} />
      </span>
      {showLabel && (
        <span className="text-sm text-text-secondary">{config.label}</span>
      )}
    </div>
  );
}

// Status selector for users to update their status
interface StatusSelectorProps {
  currentStatus: PlayerStatus;
  onStatusChange: (status: PlayerStatus) => void;
  className?: string;
}

export function StatusSelector({
  currentStatus,
  onStatusChange,
  className,
}: StatusSelectorProps) {
  const statuses: PlayerStatus[] = ['on-way', 'here', 'ready'];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-text-muted">My status:</span>
      <div className="flex gap-1">
        {statuses.map((status) => {
          const config = statusConfig[status];
          const isActive = currentStatus === status;

          return (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all',
                'min-h-[44px]', // Touch target
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-secondary hover:bg-secondary-300 text-text-secondary'
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isActive ? 'bg-white' : config.color
                )}
              />
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Participant status list
interface ParticipantStatusProps {
  participants: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    status: PlayerStatus;
  }>;
  className?: string;
}

export function ParticipantStatusList({ participants, className }: ParticipantStatusProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs text-text-muted uppercase tracking-wide">Player Status</p>
      <div className="flex flex-wrap gap-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg"
          >
            <StatusIndicator status={participant.status} size="sm" />
            <span className="text-sm font-medium text-primary">
              {participant.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
