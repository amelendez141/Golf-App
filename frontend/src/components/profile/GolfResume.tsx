'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface GolfResumeStats {
  roundsPlayed: number;
  coursesVisited: number;
  connectionsMade: number;
  teeTimesHosted: number;
  teeTimesJoined: number;
  averageGroupSize: number;
  memberSince: string;
  favoriteTime?: string;
  preferredDays?: string[];
}

interface GolfResumeProps {
  stats: GolfResumeStats;
  className?: string;
}

export function GolfResume({ stats, className }: GolfResumeProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-semibold text-primary">
          Golf Resume
        </h2>
        <Badge variant="accent" size="sm">
          <TrophyIcon className="h-3 w-3 mr-1" />
          LinkUp Member
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<GolfBallIcon className="h-5 w-5" />}
          value={stats.roundsPlayed}
          label="Rounds Played"
          color="accent"
          delay={0}
        />
        <StatCard
          icon={<MapIcon className="h-5 w-5" />}
          value={stats.coursesVisited}
          label="Courses Visited"
          color="primary"
          delay={0.1}
        />
        <StatCard
          icon={<UsersIcon className="h-5 w-5" />}
          value={stats.connectionsMade}
          label="Connections Made"
          color="success"
          delay={0.2}
        />
        <StatCard
          icon={<StarIcon className="h-5 w-5" />}
          value={stats.teeTimesHosted}
          label="Tee Times Hosted"
          color="warning"
          delay={0.3}
        />
      </div>

      {/* Activity Summary */}
      <div className="grid md:grid-cols-2 gap-4 p-4 bg-secondary rounded-xl">
        <div>
          <h4 className="text-sm font-medium text-primary mb-3">Activity Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Tee Times Joined</span>
              <span className="font-medium text-primary">{stats.teeTimesJoined}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Avg. Group Size</span>
              <span className="font-medium text-primary">{stats.averageGroupSize.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Member Since</span>
              <span className="font-medium text-primary">
                {new Date(stats.memberSince).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-primary mb-3">Preferences</h4>
          <div className="space-y-2">
            {stats.favoriteTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Favorite Tee Time</span>
                <span className="font-medium text-primary">{stats.favoriteTime}</span>
              </div>
            )}
            {stats.preferredDays && stats.preferredDays.length > 0 && (
              <div className="text-sm">
                <span className="text-text-muted">Preferred Days</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {stats.preferredDays.map((day) => (
                    <Badge key={day} variant="secondary" size="sm">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-primary mb-3">Achievements</h4>
        <div className="flex flex-wrap gap-2">
          {stats.roundsPlayed >= 10 && (
            <AchievementBadge
              icon={<GolfBallIcon className="h-4 w-4" />}
              label="Active Golfer"
              description="10+ rounds played"
            />
          )}
          {stats.coursesVisited >= 5 && (
            <AchievementBadge
              icon={<MapIcon className="h-4 w-4" />}
              label="Course Explorer"
              description="5+ courses visited"
            />
          )}
          {stats.connectionsMade >= 10 && (
            <AchievementBadge
              icon={<UsersIcon className="h-4 w-4" />}
              label="Network Builder"
              description="10+ connections"
            />
          )}
          {stats.teeTimesHosted >= 5 && (
            <AchievementBadge
              icon={<StarIcon className="h-4 w-4" />}
              label="Host Pro"
              description="5+ tee times hosted"
            />
          )}
          {stats.roundsPlayed === 0 && stats.coursesVisited === 0 && (
            <p className="text-sm text-text-muted">
              Play more rounds to unlock achievements!
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Stat card component
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'accent' | 'primary' | 'success' | 'warning';
  delay: number;
}

function StatCard({ icon, value, label, color, delay }: StatCardProps) {
  const colorClasses = {
    accent: 'bg-accent/10 text-accent',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="text-center"
    >
      <div
        className={cn(
          'h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-2',
          colorClasses[color]
        )}
      >
        {icon}
      </div>
      <motion.p
        className="text-2xl font-bold text-primary"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.1, type: 'spring', stiffness: 300 }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-text-muted">{label}</p>
    </motion.div>
  );
}

// Achievement badge component
interface AchievementBadgeProps {
  icon: React.ReactNode;
  label: string;
  description: string;
}

function AchievementBadge({ icon, label, description }: AchievementBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg border border-accent/20"
    >
      <div className="text-accent">{icon}</div>
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </motion.div>
  );
}

// Icons
function GolfBallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  );
}
