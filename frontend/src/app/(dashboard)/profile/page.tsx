'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge, IndustryBadge, SkillBadge } from '@/components/ui/Badge';
import { GolfResume } from '@/components/profile';

// Demo profile data for display without auth
const demoProfile = {
  firstName: 'Demo',
  lastName: 'User',
  avatarUrl: null,
  industry: 'TECHNOLOGY' as const,
  skillLevel: 'INTERMEDIATE' as const,
  company: 'LinkUp Golf',
  jobTitle: 'Golf Enthusiast',
  bio: 'This is a demo profile. Sign in with Clerk to see your real profile.',
  handicap: 15,
  totalRounds: 0,
  isVerified: false,
  location: { city: 'San Francisco', state: 'CA' },
  favoriteCourses: ['Pebble Beach', 'TPC Harding Park'],
  linkedInUrl: null,
  memberSince: new Date().toISOString(),
};

// Demo golf resume stats
const demoGolfResumeStats = {
  roundsPlayed: 24,
  coursesVisited: 8,
  connectionsMade: 15,
  teeTimesHosted: 6,
  teeTimesJoined: 18,
  averageGroupSize: 3.5,
  memberSince: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
  favoriteTime: '8:00 AM',
  preferredDays: ['Saturday', 'Sunday'],
};

export default function ProfilePage() {
  const profile = demoProfile;

  return (
    <div className="py-4 sm:py-6 pb-24 sm:pb-6">
      <Container>
        {/* Auth notice */}
        <Card className="mb-4 sm:mb-6 bg-accent/5 border border-accent/20">
          <p className="text-xs sm:text-sm text-text-secondary text-center">
            This is a demo profile. Add Clerk API keys to <code className="text-xs bg-primary/10 px-1.5 py-0.5 rounded">.env.local</code> to enable authentication.
          </p>
        </Card>

        {/* Header */}
        <Card className="mb-4 sm:mb-6" padding="md">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* Avatar and Edit button row on mobile */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full">
              <Avatar
                src={profile.avatarUrl}
                firstName={profile.firstName}
                lastName={profile.lastName}
                size="2xl"
                className="ring-4 ring-accent/20"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.isVerified && (
                    <Badge variant="accent" size="sm">
                      Verified
                    </Badge>
                  )}
                </div>
                {profile.jobTitle && profile.company && (
                  <p className="text-text-secondary text-sm sm:text-base mb-3">
                    {profile.jobTitle} at {profile.company}
                  </p>
                )}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3 sm:mb-4">
                  <IndustryBadge industry={profile.industry} />
                  <SkillBadge skillLevel={profile.skillLevel} showRange />
                </div>
                {profile.bio && (
                  <p className="text-text-secondary text-sm sm:text-base max-w-xl">{profile.bio}</p>
                )}
              </div>
            </div>
            {/* Edit button - full width on mobile */}
            <Button variant="secondary" size="lg" className="w-full sm:w-auto sm:self-start">
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Golf Resume */}
        <GolfResume stats={demoGolfResumeStats} className="mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Stats */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              Golf Stats
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Handicap</span>
                <span className="font-medium text-lg sm:text-xl">{profile.handicap}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Total Rounds</span>
                <span className="font-medium text-lg sm:text-xl">{profile.totalRounds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Skill Level</span>
                <SkillBadge skillLevel={profile.skillLevel} size="sm" />
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
                <span className="font-medium text-lg sm:text-xl">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Tee Times Joined</span>
                <span className="font-medium text-lg sm:text-xl">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm sm:text-base">Member Since</span>
                <span className="text-sm text-text-secondary">Today</span>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card padding="md" className="sm:col-span-2 md:col-span-1">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              Location
            </h2>
            {profile.location ? (
              <div className="space-y-2">
                <p className="text-text-secondary text-sm sm:text-base">
                  {profile.location.city}, {profile.location.state}
                </p>
                <div className="h-24 sm:h-32 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-text-muted text-sm">Map preview</span>
                </div>
              </div>
            ) : (
              <p className="text-text-muted text-sm sm:text-base">No location set</p>
            )}
          </Card>
        </div>

        {/* Favorite Courses */}
        {profile.favoriteCourses.length > 0 && (
          <Card className="mt-4 sm:mt-6" padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
              Favorite Courses
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteCourses.map((course, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {course}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
}
