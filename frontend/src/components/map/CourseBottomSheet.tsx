'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo, useDragControls } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { PRICE_LEVEL_LABELS, COURSE_TYPES } from '@/lib/constants';
import type { MapMarker } from '@/lib/types';

interface CourseBottomSheetProps {
  marker: MapMarker | null;
  onClose: () => void;
}

export function CourseBottomSheet({ marker, onClose }: CourseBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (marker) {
      setIsExpanded(false);
    }
  }, [marker]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 300 || info.offset.y > 100) {
      onClose();
    } else if (info.velocity.y < -300 || info.offset.y < -100) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  };

  if (!marker) return null;

  const { course, openSlots, teeTimeCount } = marker;

  return (
    <AnimatePresence>
      {marker && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: isExpanded ? '10%' : '50%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
          >
            <div className="bg-card rounded-t-2xl shadow-xl overflow-hidden">
              {/* Handle - larger touch target for one-handed operation */}
              <div
                className="py-4 cursor-grab active:cursor-grabbing min-h-[44px] flex items-center justify-center"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-16 h-1.5 rounded-full bg-primary/30 mx-auto" />
              </div>

              {/* Content */}
              <div className="px-4 pb-safe">
                {/* Header */}
                <div className="flex gap-3 pb-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-primary line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-text-muted line-clamp-1">
                      {course.city}, {course.state}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={openSlots > 0 ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {teeTimeCount} tee {teeTimeCount === 1 ? 'time' : 'times'}
                      </Badge>
                      {openSlots > 0 && (
                        <Badge variant="accent" size="sm">
                          {openSlots} open
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="py-4 border-t border-primary/5 space-y-4">
                        {/* Details */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-semibold text-primary">{course.holes}</p>
                            <p className="text-xs text-text-muted">Holes</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-primary">{course.par}</p>
                            <p className="text-xs text-text-muted">Par</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-primary">
                              {course.yardage.toLocaleString()}
                            </p>
                            <p className="text-xs text-text-muted">Yards</p>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-center gap-3 text-sm text-text-secondary">
                          {course.courseType && <span>{COURSE_TYPES[course.courseType]}</span>}
                          {course.priceLevel && (
                            <>
                              <span className="text-primary/20">•</span>
                              <span>{PRICE_LEVEL_LABELS[course.priceLevel] || '$$'}</span>
                            </>
                          )}
                          {course.rating && course.rating > 0 && (
                            <>
                              <span className="text-primary/20">•</span>
                              <span className="flex items-center gap-1">
                                <StarIcon className="h-4 w-4 text-accent" />
                                {course.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Description */}
                        {course.description && (
                          <p className="text-sm text-text-secondary line-clamp-3">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action */}
                <div className="py-4 border-t border-primary/5">
                  <Link href={`/course/${course.slug}`}>
                    <Button variant="primary" fullWidth>
                      View Tee Times
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  );
}
