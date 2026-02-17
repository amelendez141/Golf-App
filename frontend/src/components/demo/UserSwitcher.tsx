'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  industry: string;
  skillLevel: string;
  handicap: number;
  city: string;
  state: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function UserSwitcher() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if authenticated
    if (isAuthenticated) return;

    // Fetch available demo users
    async function fetchUsers() {
      try {
        const response = await fetch(`${API_URL}/api/demo/users`);
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
          // Set first user as current
          if (data.data.length > 0 && !currentUser) {
            setCurrentUser(data.data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch demo users:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Hide when user is authenticated with local auth
  // Note: Must be after all hooks to comply with Rules of Hooks
  if (isAuthenticated) {
    return null;
  }

  const switchUser = async (user: DemoUser) => {
    try {
      await fetch(`${API_URL}/api/demo/switch-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setCurrentUser(user);
      setIsOpen(false);
      // Refresh the page to load new user's data
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  };

  const formatIndustry = (industry: string) => {
    return industry.charAt(0) + industry.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  if (isLoading) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Current user button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-card border border-primary/10 rounded-full pl-2 pr-4 py-2 shadow-lg hover:shadow-xl transition-all hover:border-accent/30"
      >
        <div className="relative">
          <img
            src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=Demo`}
            alt="Current user"
            className="w-10 h-10 rounded-full bg-secondary"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-primary">
            {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Demo User'}
          </p>
          <p className="text-xs text-text-muted">
            {currentUser ? formatIndustry(currentUser.industry) : 'Switch user'}
          </p>
        </div>
        <ChevronIcon className={cn('w-4 h-4 text-text-muted transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* User list dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-primary/10 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-primary/5">
              <h3 className="font-medium text-primary text-sm">Switch Demo User</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Experience the app as different professionals
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {users.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  onClick={() => switchUser(user)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                    currentUser?.id === user.id
                      ? 'bg-accent/10 border border-accent/20'
                      : 'hover:bg-primary/5'
                  )}
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}${user.lastName}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-10 h-10 rounded-full bg-secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {formatIndustry(user.industry)} · {user.city}, {user.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-accent">
                      {user.handicap.toFixed(1)} HCP
                    </p>
                    <p className="text-xs text-text-muted">
                      {user.skillLevel.charAt(0) + user.skillLevel.slice(1).toLowerCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-primary/5 bg-secondary/50">
              <p className="text-xs text-text-muted text-center">
                Showing 10 of {users.length} demo users
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
