'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge, IndustryBadge, SkillBadge } from '@/components/ui/Badge';
import { GolfResume } from '@/components/profile';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { TeeTime, Course } from '@/lib/types';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [favorites, setFavorites] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const [teeTimesRes, favoritesRes] = await Promise.all([
          api.getUserTeeTimes(),
          api.getUserFavorites(),
        ]);

        if (teeTimesRes.success && teeTimesRes.data) {
          setTeeTimes(teeTimesRes.data);
        }
        if (favoritesRes.success && favoritesRes.data) {
          setFavorites(favoritesRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [isAuthenticated]);

  // Calculate stats from tee times
  const now = new Date();
  const hostedTeeTimes = teeTimes.filter(tt => tt.host?.id === user?.id);
  const joinedTeeTimes = teeTimes.filter(tt =>
    tt.slots?.some(slot => slot.user?.id === user?.id) && tt.host?.id !== user?.id
  );
  const pastTeeTimes = teeTimes.filter(tt => new Date(tt.dateTime) < now);

  const golfResumeStats = {
    roundsPlayed: pastTeeTimes.length,
    coursesVisited: new Set(pastTeeTimes.map(tt => tt.course?.id)).size,
    connectionsMade: 0, // Would need connections API
    teeTimesHosted: hostedTeeTimes.length,
    teeTimesJoined: joinedTeeTimes.length,
    averageGroupSize: teeTimes.length > 0
      ? teeTimes.reduce((acc, tt) => acc + (tt.filledSlots || 0), 0) / teeTimes.length
      : 0,
    memberSince: user?.createdAt || new Date().toISOString(),
    favoriteTime: '8:00 AM',
    preferredDays: ['Saturday', 'Sunday'],
  };

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6 pb-24 sm:pb-6">
        <Container>
          <div className="animate-pulse space-y-6">
            <Card className="h-48" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="h-32" />
              <Card className="h-32" />
              <Card className="h-32" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-4 sm:py-6">
        <Container>
          <Card className="text-center py-12">
            <h2 className="font-serif text-xl font-semibold text-primary mb-2">
              Sign in to view your profile
            </h2>
            <p className="text-text-muted mb-4">
              Create an account or sign in to see your golf profile and stats.
            </p>
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 pb-24 sm:pb-6">
      <Container>
        {/* Header */}
        <Card className="mb-4 sm:mb-6" padding="md">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* Avatar and Edit button row on mobile */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full">
              <Avatar
                src={user.avatarUrl}
                firstName={user.firstName}
                lastName={user.lastName}
                size="2xl"
                className="ring-4 ring-accent/20"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    {user.firstName} {user.lastName}
                  </h1>
                </div>
                {user.jobTitle && user.company && (
                  <p className="text-text-secondary text-sm sm:text-base mb-3">
                    {user.jobTitle} at {user.company}
                  </p>
                )}
                {(user.jobTitle && !user.company) && (
                  <p className="text-text-secondary text-sm sm:text-base mb-3">
                    {user.jobTitle}
                  </p>
                )}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3 sm:mb-4">
                  {user.industry && <IndustryBadge industry={user.industry} />}
                  {user.skillLevel && <SkillBadge skillLevel={user.skillLevel} showRange />}
                </div>
                {user.bio && (
                  <p className="text-text-secondary text-sm sm:text-base max-w-xl">{user.bio}</p>
                )}
              </div>
            </div>
            {/* Edit button - full width on mobile */}
            <Link href="/settings" className="w-full sm:w-auto sm:self-start">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Edit Profile
              </Button>
            </Link>
          </div>
        </Card>

        {/* Golf Resume */}
        <GolfResume stats={golfResumeStats} className="mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Stats */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              Golf Stats
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Handicap</span>
                <span className="font-medium text-lg sm:text-xl">
                  {user.handicap ?? 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Total Rounds</span>
                <span className="font-medium text-lg sm:text-xl">{pastTeeTimes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Skill Level</span>
                {user.skillLevel ? (
                  <SkillBadge skillLevel={user.skillLevel} size="sm" />
                ) : (
                  <span className="text-text-muted text-sm">Not set</span>
                )}
              </div>
            </div>
          </Card>

          {/* Activity */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              LinkUp Activity
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Tee Times Hosted</span>
                <span className="font-medium text-lg sm:text-xl">{hostedTeeTimes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Tee Times Joined</span>
                <span className="font-medium text-lg sm:text-xl">{joinedTeeTimes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Courses Visited</span>
                <span className="font-medium text-lg sm:text-xl">
                  {new Set(pastTeeTimes.map(tt => tt.course?.id)).size}
                </span>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card padding="md" className="sm:col-span-2 md:col-span-1">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              Location
            </h2>
            {user.city || user.state ? (
              <div className="space-y-2">
                <p className="text-text-secondary text-sm sm:text-base">
                  {[user.city, user.state].filter(Boolean).join(', ')}
                </p>
                <div className="h-24 sm:h-32 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-text-muted text-sm">Map preview</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-text-muted text-sm sm:text-base">No location set</p>
                <Link href="/settings">
                  <Button variant="secondary" size="sm">Add Location</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Favorite Courses */}
        {favorites.length > 0 && (
          <Card className="mt-4 sm:mt-6" padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              Favorite Courses
            </h2>
            <div className="flex flex-wrap gap-2">
              {favorites.map((course) => (
                <Link key={course.id} href={`/course/${course.slug}`}>
                  <Badge variant="secondary" className="text-sm hover:bg-secondary-300 cursor-pointer">
                    {course.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {favorites.length === 0 && (
          <Card className="mt-4 sm:mt-6" padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              Favorite Courses
            </h2>
            <p className="text-text-muted text-sm mb-3">
              You haven't added any favorite courses yet.
            </p>
            <Link href="/explore">
              <Button variant="secondary" size="sm">Explore Courses</Button>
            </Link>
          </Card>
        )}
      </Container>
    </div>
  );
}
