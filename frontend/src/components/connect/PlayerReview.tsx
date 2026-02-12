'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  company?: string | null;
  jobTitle?: string | null;
}

interface PlayerReviewFormProps {
  player: Player;
  courseName: string;
  roundDate: string;
  onSubmit: (review: ReviewData) => void;
  onCancel: () => void;
}

interface ReviewData {
  revieweeId: string;
  rating: number;
  playAgain: boolean;
  punctuality: number;
  pace: number;
  etiquette: number;
  networking: number;
  comment: string;
  isPublic: boolean;
}

export function PlayerReviewForm({
  player,
  courseName,
  roundDate,
  onSubmit,
  onCancel,
}: PlayerReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [playAgain, setPlayAgain] = useState<boolean | null>(null);
  const [punctuality, setPunctuality] = useState(0);
  const [pace, setPace] = useState(0);
  const [etiquette, setEtiquette] = useState(0);
  const [networking, setNetworking] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const isValid = rating > 0 && playAgain !== null;

  const handleSubmit = () => {
    if (!isValid) return;

    onSubmit({
      revieweeId: player.id,
      rating,
      playAgain: playAgain!,
      punctuality,
      pace,
      etiquette,
      networking,
      comment,
      isPublic,
    });
  };

  return (
    <div className="space-y-6">
      {/* Player Info */}
      <div className="flex items-center gap-4">
        <Avatar
          src={player.avatarUrl}
          firstName={player.firstName}
          lastName={player.lastName}
          size="xl"
        />
        <div>
          <h3 className="font-serif text-xl font-semibold text-primary">
            Review {player.firstName}
          </h3>
          <p className="text-sm text-text-muted">
            {courseName} · {new Date(roundDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Overall Rating */}
      <Card className="p-4">
        <h4 className="font-medium text-primary mb-3">Overall Experience</h4>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-2 transition-transform hover:scale-110"
            >
              <StarIcon
                className={cn(
                  'h-10 w-10 transition-colors',
                  rating >= star
                    ? 'text-accent fill-accent'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-text-muted mt-2">
          {rating === 0 && 'Tap to rate'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Great'}
          {rating === 5 && 'Excellent'}
        </p>
      </Card>

      {/* Would Play Again */}
      <Card className="p-4">
        <h4 className="font-medium text-primary mb-3">Would you play with them again?</h4>
        <div className="flex gap-3">
          <button
            onClick={() => setPlayAgain(true)}
            className={cn(
              'flex-1 py-3 rounded-lg border-2 font-medium transition-all',
              playAgain === true
                ? 'border-success bg-success/10 text-success'
                : 'border-primary/10 text-text-secondary hover:border-primary/20'
            )}
          >
            <ThumbUpIcon className="h-5 w-5 mx-auto mb-1" />
            Yes
          </button>
          <button
            onClick={() => setPlayAgain(false)}
            className={cn(
              'flex-1 py-3 rounded-lg border-2 font-medium transition-all',
              playAgain === false
                ? 'border-error bg-error/10 text-error'
                : 'border-primary/10 text-text-secondary hover:border-primary/20'
            )}
          >
            <ThumbDownIcon className="h-5 w-5 mx-auto mb-1" />
            No
          </button>
        </div>
      </Card>

      {/* Detailed Ratings */}
      <Card className="p-4">
        <h4 className="font-medium text-primary mb-4">Details (Optional)</h4>
        <div className="space-y-4">
          <RatingRow
            label="Punctuality"
            description="Arrived on time"
            value={punctuality}
            onChange={setPunctuality}
          />
          <RatingRow
            label="Pace of Play"
            description="Good pace, kept up"
            value={pace}
            onChange={setPace}
          />
          <RatingRow
            label="Golf Etiquette"
            description="Respectful on the course"
            value={etiquette}
            onChange={setEtiquette}
          />
          <RatingRow
            label="Networking"
            description="Good conversation"
            value={networking}
            onChange={setNetworking}
          />
        </div>
      </Card>

      {/* Comment */}
      <Card className="p-4">
        <h4 className="font-medium text-primary mb-3">Additional Comments (Optional)</h4>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share more about your experience..."
          className="w-full rounded-lg border border-primary/10 bg-secondary p-3 text-sm text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          rows={3}
        />
      </Card>

      {/* Privacy */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-primary/20 text-accent focus:ring-accent"
        />
        <div>
          <span className="text-sm font-medium text-primary">
            Show on their profile
          </span>
          <p className="text-xs text-text-muted mt-0.5">
            Public reviews help others find great playing partners. Only your star rating and "would play again" will be shown.
          </p>
        </div>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
}

interface RatingRowProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}

function RatingRow({ label, description, value, onChange }: RatingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(value === star ? 0 : star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <StarIcon
              className={cn(
                'h-5 w-5 transition-colors',
                value >= star
                  ? 'text-accent fill-accent'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// Review Display Component
interface ReviewDisplayProps {
  review: {
    reviewer: {
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    };
    rating: number;
    playAgain: boolean;
    comment?: string | null;
    createdAt: string;
    courseName?: string;
  };
}

export function ReviewDisplay({ review }: ReviewDisplayProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar
          src={review.reviewer.avatarUrl}
          firstName={review.reviewer.firstName}
          lastName={review.reviewer.lastName}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-primary text-sm">
              {review.reviewer.firstName} {review.reviewer.lastName}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    review.rating >= star
                      ? 'text-accent fill-accent'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {review.playAgain ? (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <ThumbUpIcon className="h-3 w-3" />
                Would play again
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <ThumbDownIcon className="h-3 w-3" />
                Wouldn't play again
              </span>
            )}
            {review.courseName && (
              <span className="text-xs text-text-muted">· {review.courseName}</span>
            )}
          </div>
          {review.comment && (
            <p className="text-sm text-text-secondary mt-2">{review.comment}</p>
          )}
          <p className="text-xs text-text-muted mt-2">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Player Stats from Reviews
interface PlayerReviewStatsProps {
  stats: {
    totalReviews: number;
    averageRating: number;
    wouldPlayAgainPercent: number;
    punctualityAvg?: number;
    paceAvg?: number;
    etiquetteAvg?: number;
    networkingAvg?: number;
  };
  className?: string;
}

export function PlayerReviewStats({ stats, className }: PlayerReviewStatsProps) {
  return (
    <Card className={cn('p-4', className)}>
      <h3 className="font-serif font-semibold text-primary mb-4">Playing Partner Rating</h3>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold text-primary">
            {stats.averageRating.toFixed(1)}
          </div>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    stats.averageRating >= star
                      ? 'text-accent fill-accent'
                      : stats.averageRating >= star - 0.5
                      ? 'text-accent fill-accent/50'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted">{stats.totalReviews} reviews</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-success">
            {stats.wouldPlayAgainPercent}%
          </p>
          <p className="text-xs text-text-muted">would play again</p>
        </div>
      </div>

      {(stats.punctualityAvg || stats.paceAvg || stats.etiquetteAvg || stats.networkingAvg) && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-primary/10">
          {stats.punctualityAvg && (
            <StatBar label="Punctuality" value={stats.punctualityAvg} />
          )}
          {stats.paceAvg && (
            <StatBar label="Pace" value={stats.paceAvg} />
          )}
          {stats.etiquetteAvg && (
            <StatBar label="Etiquette" value={stats.etiquetteAvg} />
          )}
          {stats.networkingAvg && (
            <StatBar label="Networking" value={stats.networkingAvg} />
          )}
        </div>
      )}
    </Card>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const percentage = (value / 5) * 100;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-secondary">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full bg-accent rounded-full"
        />
      </div>
    </div>
  );
}

// Icons
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function ThumbUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
    </svg>
  );
}

function ThumbDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
    </svg>
  );
}
