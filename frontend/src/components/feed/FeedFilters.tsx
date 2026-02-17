'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { INDUSTRIES, SKILL_LEVELS } from '@/lib/constants';
import { useFeedStore } from '@/lib/stores/feedStore';
import type { Industry, SkillLevel } from '@/lib/types';

interface FeedFiltersProps {
  className?: string;
}

export function FeedFilters({ className }: FeedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { filters, setIndustry, setSkillLevel, clearFilters } = useFeedStore();

  const hasActiveFilters = filters.industry !== undefined || filters.skillLevel !== undefined;

  const selectIndustry = (industry: Industry) => {
    if (filters.industry === industry) {
      setIndustry(undefined);
    } else {
      setIndustry(industry);
    }
  };

  const selectSkillLevel = (skillLevel: SkillLevel) => {
    if (filters.skillLevel === skillLevel) {
      setSkillLevel(undefined);
    } else {
      setSkillLevel(skillLevel);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Quick filters row - horizontal scroll on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1 snap-x-mandatory">
        <Button
          variant={isExpanded ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setIsExpanded(!isExpanded)}
          leftIcon={<FilterIcon className="h-4 w-4" />}
          className="shrink-0 snap-start"
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-white">
              {(filters.industry ? 1 : 0) + (filters.skillLevel ? 1 : 0)}
            </span>
          )}
        </Button>

        {/* Quick industry filters - larger touch targets */}
        {INDUSTRIES.slice(0, 4).map((industry) => (
          <button
            key={industry.id}
            onClick={() => selectIndustry(industry.id)}
            className={cn(
              'shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-manipulation snap-start min-h-[44px] active:scale-95',
              filters.industry === industry.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-secondary-200 text-text-secondary hover:bg-secondary-300'
            )}
          >
            {industry.label.split(' ')[0]}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 px-3 py-2 text-sm text-text-muted hover:text-primary transition-colors touch-manipulation min-h-[44px] snap-start"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-primary/5 p-4 space-y-5 shadow-sm">
              {/* Industries */}
              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => selectIndustry(industry.id)}
                      className={cn(
                        'px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-manipulation min-h-[44px] active:scale-95',
                        filters.industry === industry.id
                          ? `${industry.bgClass} shadow-sm`
                          : 'bg-secondary-200 text-text-secondary hover:bg-secondary-300'
                      )}
                    >
                      {industry.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Levels */}
              <div>
                <h4 className="text-sm font-medium text-primary mb-3">Skill Level</h4>
                <div className="flex flex-wrap gap-2">
                  {SKILL_LEVELS.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => selectSkillLevel(skill.id)}
                      className={cn(
                        'px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-manipulation min-h-[44px] active:scale-95',
                        filters.skillLevel === skill.id
                          ? `${skill.bgClass} shadow-sm`
                          : 'bg-secondary-200 text-text-secondary hover:bg-secondary-300'
                      )}
                    >
                      {skill.label} ({skill.handicapRange})
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-primary/5">
                <Button variant="ghost" size="md" onClick={() => setIsExpanded(false)}>
                  Close
                </Button>
                {hasActiveFilters && (
                  <Button variant="secondary" size="md" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  );
}
