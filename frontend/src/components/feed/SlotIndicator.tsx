'use client';

import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import type { TeeTimeSlot, UserPublic } from '@/lib/types';

interface SlotIndicatorProps {
  slots: TeeTimeSlot[];
  totalSlots?: number;
  hostId?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function SlotIndicator({
  slots,
  totalSlots = 4,
  hostId,
  size = 'md',
  showLabels = false,
  className,
}: SlotIndicatorProps) {
  // Create array of slots, filling empty positions
  const normalizedSlots: (TeeTimeSlot | null)[] = [];
  for (let i = 1; i <= totalSlots; i++) {
    const slot = slots.find((s) => s.slotNumber === i);
    normalizedSlots.push(slot || null);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {normalizedSlots.map((slot, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <SlotDot
            slot={slot}
            size={size}
            position={index + 1}
            isHost={slot?.slotNumber === 1 || slot?.user?.id === hostId}
          />
          {showLabels && (
            <span className="text-xs text-text-muted">
              {slot?.user?.firstName || `Slot ${index + 1}`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

interface SlotDotProps {
  slot: TeeTimeSlot | null;
  size: 'sm' | 'md' | 'lg';
  position: number;
  isHost?: boolean;
}

function SlotDot({ slot, size, position, isHost = false }: SlotDotProps) {
  const isFilled = slot?.user !== null;

  if (isFilled && slot?.user) {
    return (
      <div className="relative">
        <Avatar
          src={slot.user.avatarUrl}
          firstName={slot.user.firstName}
          lastName={slot.user.lastName}
          size={size}
          className={cn(
            'ring-2',
            isHost ? 'ring-accent' : 'ring-primary/20'
          )}
        />
        {isHost && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-accent rounded-full p-0.5">
            <CrownIcon className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    );
  }

  // Open slot
  return (
    <div
      className={cn(
        sizeClasses[size],
        'flex items-center justify-center rounded-full',
        'border-2 border-dashed border-primary/20 bg-secondary',
        'hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer'
      )}
    >
      <PlusIcon className="h-4 w-4 text-text-muted" />
    </div>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2l2.5 5 5.5.5-4 4 1 5.5L10 14l-5 3 1-5.5-4-4 5.5-.5L10 2z" />
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

// New visual slot indicator with simple circles
interface VisualSlotIndicatorProps {
  slots: TeeTimeSlot[];
  totalSlots?: number;
  hostId?: string;
  className?: string;
}

export function VisualSlotIndicator({
  slots,
  totalSlots = 4,
  hostId,
  className,
}: VisualSlotIndicatorProps) {
  const filledSlots = slots.filter((s) => s.user !== null).length;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {Array.from({ length: totalSlots }).map((_, index) => {
        const slot = slots.find((s) => s.slotNumber === index + 1);
        const isFilled = slot?.user !== null;
        const isHost = slot?.user?.id === hostId || (index === 0 && isFilled);

        return (
          <div
            key={index}
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center transition-all',
              isFilled
                ? isHost
                  ? 'bg-accent text-white'
                  : 'bg-primary text-white'
                : 'border-2 border-dashed border-primary/20 bg-transparent'
            )}
          >
            {isFilled ? (
              slot?.user?.avatarUrl ? (
                <img
                  src={slot.user.avatarUrl}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium">
                  {slot?.user?.firstName?.[0] || (index + 1)}
                </span>
              )
            ) : (
              <span className="text-xs text-text-muted">{index + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
