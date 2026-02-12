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
  industry: 'tech' as const,
  skillLevel: 'intermediate' as const,
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
    <div className="py-6">
      <Container>
        {/* Auth notice */}
        <Card className="mb-6 bg-accent/5 border border-accent/20">
          <p className="text-sm text-text-secondary text-center">
            This is a demo profile. Add Clerk API keys to <code className="text-xs bg-primary/10 px-1 py-0.5 rounded">.env.local</code> to enable authentication.
          </p>
        </Card>

        {/* Header */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar
              src={profile.avatarUrl}
              firstName={profile.firstName}
              lastName={profile.lastName}
              size="2xl"
              className="ring-4 ring-accent/20"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="font-serif text-2xl font-bold text-primary">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.isVerified && (
                  <Badge variant="accent" size="sm">
                    Verified
                  </Badge>
                )}
              </div>
              {profile.jobTitle && profile.company && (
                <p className="text-text-secondary mb-3">
                  {profile.jobTitle} at {profile.company}
                </p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                <IndustryBadge industry={profile.industry} />
                <SkillBadge skillLevel={profile.skillLevel} showRange />
              </div>
              {profile.bio && (
                <p className="text-text-secondary max-w-xl">{profile.bio}</p>
              )}
            </div>
            <Button variant="secondary">Edit Profile</Button>
          </div>
        </Card>

        {/* Golf Resume */}
        <GolfResume stats={demoGolfResumeStats} className="mb-6" />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Stats */}
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
              Golf Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Handicap</span>
                <span className="font-medium text-xl">{profile.handicap}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Total Rounds</span>
                <span className="font-medium text-xl">{profile.totalRounds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Skill Level</span>
                <SkillBadge skillLevel={profile.skillLevel} size="sm" />
              </div>
            </div>
          </Card>

          {/* Activity */}
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
              LinkUp Activity
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Tee Times Hosted</span>
                <span className="font-medium text-xl">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Tee Times Joined</span>
                <span className="font-medium text-xl">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Member Since</span>
                <span className="text-sm text-text-secondary">Today</span>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
              Location
            </h2>
            {profile.location ? (
              <div className="space-y-2">
                <p className="text-text-secondary">
                  {profile.location.city}, {profile.location.state}
                </p>
                <div className="h-32 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-text-muted text-sm">Map preview</span>
                </div>
              </div>
            ) : (
              <p className="text-text-muted">No location set</p>
            )}
          </Card>
        </div>

        {/* Favorite Courses */}
        {profile.favoriteCourses.length > 0 && (
          <Card className="mt-6">
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
              Favorite Courses
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteCourses.map((course, i) => (
                <Badge key={i} variant="secondary">
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
