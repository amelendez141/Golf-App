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
  industry?: string | null;
  linkedInUrl?: string | null;
}

interface PostRoundConnectProps {
  players: Player[];
  teeTimeId: string;
  courseName: string;
  onComplete: () => void;
  className?: string;
}

interface ConnectionRequest {
  playerId: string;
  message: string;
  shareContact: boolean;
}

export function PostRoundConnect({
  players,
  teeTimeId,
  courseName,
  onComplete,
  className,
}: PostRoundConnectProps) {
  const [step, setStep] = useState<'rate' | 'connect' | 'complete'>('rate');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleRating = (playerId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [playerId]: rating }));
  };

  const handleConnect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleSendConnection = (message: string, shareContact: boolean) => {
    if (selectedPlayer) {
      setConnections((prev) => [
        ...prev,
        { playerId: selectedPlayer.id, message, shareContact },
      ]);
      setSelectedPlayer(null);
    }
  };

  const handleComplete = async () => {
    // In production, this would send ratings and connections to the API
    console.log('Submitting:', { ratings, connections, teeTimeId });
    setStep('complete');
    setTimeout(onComplete, 2000);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <AnimatePresence mode="wait">
        {step === 'rate' && (
          <motion.div
            key="rate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">
                Great Round!
              </h2>
              <p className="text-text-secondary">
                How was your experience at {courseName}?
              </p>
            </div>

            <div className="space-y-4">
              {players.map((player) => (
                <Card key={player.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={player.avatarUrl}
                      firstName={player.firstName}
                      lastName={player.lastName}
                      size="lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-primary">
                        {player.firstName} {player.lastName}
                      </p>
                      {player.jobTitle && player.company && (
                        <p className="text-sm text-text-muted">
                          {player.jobTitle} at {player.company}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(player.id, star)}
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`Rate ${star} stars`}
                        >
                          <StarIcon
                            className={cn(
                              'h-6 w-6 transition-colors',
                              (ratings[player.id] || 0) >= star
                                ? 'text-accent fill-accent'
                                : 'text-gray-300 dark:text-gray-600'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setStep('connect')}
              disabled={Object.keys(ratings).length === 0}
            >
              Continue to Connect
            </Button>
          </motion.div>
        )}

        {step === 'connect' && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">
                Stay Connected
              </h2>
              <p className="text-text-secondary">
                Would you like to connect with anyone from today's round?
              </p>
            </div>

            <div className="space-y-4">
              {players.map((player) => {
                const isConnected = connections.some(
                  (c) => c.playerId === player.id
                );

                return (
                  <Card key={player.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={player.avatarUrl}
                        firstName={player.firstName}
                        lastName={player.lastName}
                        size="lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-primary">
                          {player.firstName} {player.lastName}
                        </p>
                        {player.jobTitle && player.company && (
                          <p className="text-sm text-text-muted">
                            {player.jobTitle} at {player.company}
                          </p>
                        )}
                        {player.linkedInUrl && (
                          <a
                            href={player.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            <LinkedInIcon className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                      {isConnected ? (
                        <span className="text-sm text-success font-medium flex items-center gap-1">
                          <CheckIcon className="h-4 w-4" />
                          Request Sent
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleConnect(player)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setStep('rate')}
              >
                Back
              </Button>
              <Button variant="primary" fullWidth onClick={handleComplete}>
                {connections.length > 0
                  ? `Send ${connections.length} Connection${connections.length > 1 ? 's' : ''}`
                  : 'Skip & Finish'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success/10 mb-6"
            >
              <CheckIcon className="h-10 w-10 text-success" />
            </motion.div>
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">
              All Done!
            </h2>
            <p className="text-text-secondary">
              {connections.length > 0
                ? 'Your connection requests have been sent.'
                : 'Thanks for rating your round!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Request Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <ConnectionRequestModal
            player={selectedPlayer}
            onSubmit={handleSendConnection}
            onCancel={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ConnectionRequestModalProps {
  player: Player;
  onSubmit: (message: string, shareContact: boolean) => void;
  onCancel: () => void;
}

function ConnectionRequestModal({
  player,
  onSubmit,
  onCancel,
}: ConnectionRequestModalProps) {
  const [message, setMessage] = useState(
    `Great playing with you today! Would love to connect and play again sometime.`
  );
  const [shareContact, setShareContact] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl p-6 max-w-md w-full space-y-4"
      >
        <div className="flex items-center gap-3">
          <Avatar
            src={player.avatarUrl}
            firstName={player.firstName}
            lastName={player.lastName}
            size="lg"
          />
          <div>
            <h3 className="font-serif font-semibold text-primary">
              Connect with {player.firstName}
            </h3>
            {player.company && (
              <p className="text-sm text-text-muted">{player.company}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Personal Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-primary/10 bg-secondary p-3 text-sm text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            rows={3}
            placeholder="Add a personal note..."
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={shareContact}
            onChange={(e) => setShareContact(e.target.checked)}
            className="h-5 w-5 rounded border-primary/20 text-accent focus:ring-accent"
          />
          <span className="text-sm text-text-secondary">
            Share my contact info (email, phone)
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => onSubmit(message, shareContact)}
          >
            Send Request
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
