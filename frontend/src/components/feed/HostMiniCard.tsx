'use client';

import { cn, formatHandicap, getIndustryLabel } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import type { UserPublic } from '@/lib/types';

interface HostMiniCardProps {
  user: UserPublic;
  showDetails?: boolean;
  className?: string;
}

export function HostMiniCard({
  user,
  showDetails = true,
  className,
}: HostMiniCardProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar
        src={user.avatarUrl}
        firstName={user.firstName}
        lastName={user.lastName}
        size="md"
        className="ring-2 ring-accent/20"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary truncate">
            {user.firstName} {user.lastName}
          </span>
        </div>
        {showDetails && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            {user.industry && (
              <span className="truncate">{getIndustryLabel(user.industry)}</span>
            )}
            {user.industry && user.handicap !== null && (
              <span className="text-primary/20">•</span>
            )}
            {user.handicap !== null && (
              <span>{formatHandicap(user.handicap)} HCP</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
