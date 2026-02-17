'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/layout/Container';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { IndustryBadge, SkillBadge, Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { SlotIndicator } from '@/components/feed/SlotIndicator';
import { useJoinTeeTime } from '@/hooks/useJoinTeeTime';
import { Confetti, SuccessCheckmark, useCelebration } from '@/components/animations';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import {
  formatSmartDate,
  formatHandicap,
  getIndustryLabel,
  countOpenSlots,
  cn,
} from '@/lib/utils';
import { PRICE_LEVEL_LABELS, COURSE_TYPES } from '@/lib/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeeTimeDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const teeTimeId = resolvedParams.id;
  const toast = useToast();
  const { isActive: showConfetti, origin, celebrate, reset } = useCelebration();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teeTime', teeTimeId],
    queryFn: async () => {
      const response = await api.getTeeTime(teeTimeId);
      return response.data;
    },
    enabled: !!teeTimeId,
  });

  const joinMutation = useJoinTeeTime();

  if (isLoading) {
    return <TeeTimeDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <Container className="py-12">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">
              Tee Time Not Found
            </h1>
            <p className="text-text-muted mb-6">
              This tee time may have been cancelled or doesn&apos;t exist.
            </p>
            <Link href="/feed">
              <Button>Browse Tee Times</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const teeTime = data;
  const openSlots = countOpenSlots(teeTime.slots);
  const firstOpenSlot = teeTime.slots.find((slot) => !slot.user);

  const handleJoin = async (e: React.MouseEvent) => {
    if (!firstOpenSlot) return;
    try {
      await joinMutation.mutateAsync({
        teeTimeId: teeTime.id,
        slotNumber: firstOpenSlot.slotNumber,
      });
      // Trigger celebration
      celebrate(e);
      setShowSuccess(true);
      toast.success('Joined!', 'You have successfully joined the tee time.');
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to join:', error);
      toast.error('Could not join', 'Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Success celebration effects */}
      <Confetti
        active={showConfetti}
        onComplete={reset}
        originX={origin.x}
        originY={origin.y}
        particleCount={50}
      />

      <Navbar />

      {/* Hero Image */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
        {teeTime.course.imageUrl ? (
          <Image
            src={teeTime.course.imageUrl}
            alt={teeTime.course.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Course info overlay */}
        <Container className="absolute bottom-0 left-0 right-0 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
            <div>
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                {teeTime.course.name}
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                {teeTime.course.city}, {teeTime.course.state}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Badge variant="secondary" size="sm" className="sm:text-sm">
                {COURSE_TYPES[teeTime.course.courseType]}
              </Badge>
              {teeTime.course.greenFee && (
                <Badge variant="secondary" size="sm" className="sm:text-sm">
                  ${(teeTime.course.greenFee / 100).toFixed(0)}
                </Badge>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4 sm:py-6 pb-24 sm:pb-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial="initial"
            animate="enter"
            variants={{
              initial: {},
              enter: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            {/* Date/Time Card */}
            <motion.div
              variants={{
                initial: { opacity: 0, y: 15 },
                enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
            >
              <Card>
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
                  >
                    <CalendarIcon className="h-7 w-7" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-text-muted">Tee Time</p>
                    <p className="text-xl font-serif font-semibold text-primary">
                      {formatSmartDate(teeTime.dateTime)}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Players Card */}
            <Card>
              <h2 className="font-serif text-lg font-semibold text-primary mb-4">
                Players ({teeTime.slots.filter((s) => s.user).length}/
                {teeTime.totalSlots})
              </h2>

              <div className="space-y-4">
                {teeTime.slots.map((slot, index) => {
                  const isHost = slot.user?.id === teeTime.host?.id;
                  const isOpen = !slot.user;

                  return (
                  <motion.div
                    key={slot.slotNumber}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.08,
                      ease: [0, 0, 0.2, 1],
                    }}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl',
                      isOpen
                        ? 'border-2 border-dashed border-primary/10 bg-secondary'
                        : 'bg-secondary'
                    )}
                  >
                    {slot.user ? (
                      <>
                        <Avatar
                          src={slot.user.avatarUrl}
                          firstName={slot.user.firstName}
                          lastName={slot.user.lastName}
                          size="lg"
                          className={cn(
                            'ring-2',
                            isHost ? 'ring-accent' : 'ring-primary/10'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">
                              {slot.user.firstName} {slot.user.lastName}
                            </span>
                            {isHost && (
                              <Badge variant="accent" size="sm">
                                Host
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <span>{getIndustryLabel(slot.user.industry)}</span>
                            {slot.user.handicap !== null && (
                              <>
                                <span className="text-primary/20">•</span>
                                <span>{formatHandicap(slot.user.handicap)} HCP</span>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-4 flex-1">
                        <motion.div
                          className="h-12 w-12 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center"
                          animate={{
                            borderColor: ['rgba(27, 58, 45, 0.2)', 'rgba(27, 58, 45, 0.4)', 'rgba(27, 58, 45, 0.2)'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <PlusIcon className="h-5 w-5 text-text-muted" />
                        </motion.div>
                        <span className="text-text-muted">Open spot</span>
                      </div>
                    )}
                  </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* Preferences */}
            {(teeTime.preferredIndustries?.length || teeTime.preferredSkillLevel) && (
              <Card>
                <h2 className="font-serif text-lg font-semibold text-primary mb-4">
                  Preferences
                </h2>
                <div className="space-y-4">
                  {teeTime.preferredIndustries?.length > 0 && (
                    <div>
                      <p className="text-sm text-text-muted mb-2">
                        Preferred Industries
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {teeTime.preferredIndustries.map((industry) => (
                          <IndustryBadge key={industry} industry={industry} />
                        ))}
                      </div>
                    </div>
                  )}
                  {teeTime.preferredSkillLevel && (
                    <div>
                      <p className="text-sm text-text-muted mb-2">
                        Preferred Skill Level
                      </p>
                      <SkillBadge skillLevel={teeTime.preferredSkillLevel} showRange />
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Notes */}
            {teeTime.notes && (
              <Card>
                <h2 className="font-serif text-lg font-semibold text-primary mb-3">
                  Notes from Host
                </h2>
                <p className="text-text-secondary">{teeTime.notes}</p>
              </Card>
            )}
          </motion.div>

          {/* Sidebar - becomes bottom sticky on mobile */}
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Join Card - Sticky on both mobile (bottom) and desktop (top) */}
            <Card className="lg:sticky lg:top-20">
              <div className="text-center mb-4 relative">
                {/* Success checkmark overlay */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-card/95 rounded-xl z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <SuccessCheckmark show={showSuccess} size="lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-sm text-text-muted mb-1">
                  {openSlots > 0
                    ? `${openSlots} ${openSlots === 1 ? 'spot' : 'spots'} available`
                    : 'All spots filled'}
                </p>
                <SlotIndicator slots={teeTime.slots} size="lg" className="justify-center" />
              </div>

              {openSlots > 0 ? (
                <Button
                  variant="accent"
                  fullWidth
                  size="xl"
                  onClick={handleJoin}
                  isLoading={joinMutation.isPending}
                  className="touch-manipulation"
                >
                  Request to Join
                </Button>
              ) : (
                <Button variant="secondary" fullWidth size="xl" disabled>
                  Fully Booked
                </Button>
              )}

              <p className="text-xs text-text-muted text-center mt-3">
                The host will review and approve your request
              </p>
            </Card>

            {/* Mobile-only floating join button */}
            <div className="fixed bottom-20 left-4 right-4 lg:hidden z-40 safe-bottom">
              {openSlots > 0 ? (
                <Button
                  variant="accent"
                  fullWidth
                  size="xl"
                  onClick={handleJoin}
                  isLoading={joinMutation.isPending}
                  className="shadow-lg touch-manipulation"
                >
                  Request to Join - {openSlots} {openSlots === 1 ? 'spot' : 'spots'} left
                </Button>
              ) : (
                <Button variant="secondary" fullWidth size="xl" disabled className="shadow-lg">
                  Fully Booked
                </Button>
              )}
            </div>

            {/* Host Card */}
            <Card>
              <h3 className="text-sm text-text-muted mb-3">Hosted by</h3>
              <div className="flex items-center gap-3">
                <Avatar
                  src={teeTime.host.avatarUrl}
                  firstName={teeTime.host.firstName}
                  lastName={teeTime.host.lastName}
                  size="lg"
                  className="ring-2 ring-accent"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary">
                    {teeTime.host.firstName} {teeTime.host.lastName}
                  </p>
                  <p className="text-sm text-text-muted">
                    {getIndustryLabel(teeTime.host.industry)}
                  </p>
                </div>
              </div>
              <Link href={`/profile/${teeTime.host.id}`}>
                <Button variant="ghost" fullWidth size="sm" className="mt-3">
                  View Profile
                </Button>
              </Link>
            </Card>

            {/* Course Card */}
            <Card>
              <h3 className="text-sm text-text-muted mb-3">Course Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Holes</span>
                  <span className="font-medium">{teeTime.course.holes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Par</span>
                  <span className="font-medium">{teeTime.course.par}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Yardage</span>
                  <span className="font-medium">
                    {teeTime.course.yardage.toLocaleString()}
                  </span>
                </div>
              </div>
              <Link href={`/course/${teeTime.course.slug}`}>
                <Button variant="ghost" fullWidth size="sm" className="mt-3">
                  View Course
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

function TeeTimeDetailSkeleton() {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <Skeleton className="h-64 md:h-80 w-full rounded-none" />
      <Container className="py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
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
