'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmptyFeedProps {
  title?: string;
  description?: string;
  showCTA?: boolean;
  className?: string;
}

export function EmptyFeed({
  title = 'No tee times found',
  description = "There aren't any tee times matching your filters. Try adjusting your search or be the first to post!",
  showCTA = true,
  className,
}: EmptyFeedProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="w-24 h-24 mb-6 text-primary/20">
        <GolfFlagIcon className="w-full h-full" />
      </div>
      <h3 className="text-lg font-serif font-semibold text-primary text-center mb-2">
        {title}
      </h3>
      <p className="text-text-muted text-center max-w-md mb-6">
        {description}
      </p>
      {showCTA && (
        <Link href="/post">
          <Button variant="accent" leftIcon={<PlusIcon className="h-4 w-4" />}>
            Post a Tee Time
          </Button>
        </Link>
      )}
    </div>
  );
}

function GolfFlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="30" y1="10" x2="30" y2="90" strokeLinecap="round" />
      <path d="M30 10 L70 25 L30 40 Z" fill="currentColor" fillOpacity="0.1" />
      <ellipse cx="50" cy="90" rx="25" ry="5" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
