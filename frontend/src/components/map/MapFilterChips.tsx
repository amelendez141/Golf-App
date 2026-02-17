'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CourseTypeFilter = 'all' | 'public' | 'private' | 'semi-private' | 'resort' | 'municipal';
export type AvailabilityFilter = 'all' | 'available' | 'today' | 'tomorrow';
export type PriceFilter = 'all' | '$' | '$$' | '$$$' | '$$$$';

export interface MapFilters {
  courseType: CourseTypeFilter;
  availability: AvailabilityFilter;
  price: PriceFilter;
}

interface MapFilterChipsProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  className?: string;
}

export function MapFilterChips({ filters, onChange, className }: MapFilterChipsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleFilterChange = <K extends keyof MapFilters>(
    key: K,
    value: MapFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
    setExpanded(null);
  };

  return (
    <div className={cn('flex gap-2 overflow-x-auto no-scrollbar pb-1 -mb-1 snap-x-mandatory', className)}>
      {/* Course Type Filter */}
      <FilterChip
        label="Course Type"
        value={filters.courseType === 'all' ? 'All Types' : formatCourseType(filters.courseType)}
        isActive={filters.courseType !== 'all'}
        isExpanded={expanded === 'courseType'}
        onToggle={() => setExpanded(expanded === 'courseType' ? null : 'courseType')}
        options={[
          { value: 'all', label: 'All Types' },
          { value: 'public', label: 'Public' },
          { value: 'private', label: 'Private' },
          { value: 'semi-private', label: 'Semi-Private' },
          { value: 'resort', label: 'Resort' },
          { value: 'municipal', label: 'Municipal' },
        ]}
        onSelect={(value) => handleFilterChange('courseType', value as CourseTypeFilter)}
      />

      {/* Availability Filter */}
      <FilterChip
        label="Availability"
        value={formatAvailability(filters.availability)}
        isActive={filters.availability !== 'all'}
        isExpanded={expanded === 'availability'}
        onToggle={() => setExpanded(expanded === 'availability' ? null : 'availability')}
        options={[
          { value: 'all', label: 'Any Time' },
          { value: 'available', label: 'Open Spots' },
          { value: 'today', label: 'Today' },
          { value: 'tomorrow', label: 'Tomorrow' },
        ]}
        onSelect={(value) => handleFilterChange('availability', value as AvailabilityFilter)}
      />

      {/* Price Filter */}
      <FilterChip
        label="Price"
        value={filters.price === 'all' ? 'Any Price' : filters.price}
        isActive={filters.price !== 'all'}
        isExpanded={expanded === 'price'}
        onToggle={() => setExpanded(expanded === 'price' ? null : 'price')}
        options={[
          { value: 'all', label: 'Any Price' },
          { value: '$', label: '$ (Under $50)' },
          { value: '$$', label: '$$ ($50-100)' },
          { value: '$$$', label: '$$$ ($100-200)' },
          { value: '$$$$', label: '$$$$ ($200+)' },
        ]}
        onSelect={(value) => handleFilterChange('price', value as PriceFilter)}
      />

      {/* Clear all button */}
      {(filters.courseType !== 'all' ||
        filters.availability !== 'all' ||
        filters.price !== 'all') && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() =>
            onChange({ courseType: 'all', availability: 'all', price: 'all' })
          }
          className="px-3 py-2 rounded-full bg-error/10 text-error text-sm font-medium hover:bg-error/20 transition-colors min-h-[44px]"
        >
          Clear All
        </motion.button>
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  value: string;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}

function FilterChip({
  label,
  value,
  isActive,
  isExpanded,
  onToggle,
  options,
  onSelect,
}: FilterChipProps) {
  return (
    <div className="relative shrink-0 snap-start">
      <button
        onClick={onToggle}
        className={cn(
          'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] touch-manipulation whitespace-nowrap',
          'shadow-md active:scale-95',
          isActive
            ? 'bg-accent text-white'
            : 'bg-card text-text-secondary hover:bg-secondary-300'
        )}
      >
        <span>{value}</span>
        <ChevronIcon
          className={cn(
            'h-4 w-4 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          className="absolute top-full left-0 mt-1 bg-card rounded-xl shadow-lg border border-primary/5 py-1.5 min-w-[160px] z-50"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                'w-full px-4 py-3 text-left text-sm hover:bg-secondary transition-colors touch-manipulation min-h-[44px]',
                option.value === (isActive ? value : 'all')
                  ? 'text-accent font-medium'
                  : 'text-text-secondary'
              )}
            >
              {option.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function formatCourseType(type: CourseTypeFilter): string {
  const labels: Record<CourseTypeFilter, string> = {
    all: 'All Types',
    public: 'Public',
    private: 'Private',
    'semi-private': 'Semi-Private',
    resort: 'Resort',
    municipal: 'Municipal',
  };
  return labels[type];
}

function formatAvailability(availability: AvailabilityFilter): string {
  const labels: Record<AvailabilityFilter, string> = {
    all: 'Any Time',
    available: 'Open Spots',
    today: 'Today',
    tomorrow: 'Tomorrow',
  };
  return labels[availability];
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
