'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useOnlineStatus } from '@/hooks/useServiceWorker';

export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect when back online
  useEffect(() => {
    if (mounted && isOnline) {
      window.location.href = '/feed';
    }
  }, [isOnline, mounted]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <WifiOffIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">
            You're Offline
          </h1>
          <p className="text-text-secondary">
            It looks like you've lost your internet connection. Some features may be limited.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-text-muted">
            Don't worry - you can still view cached course information and your recent tee times.
          </p>

          <Button
            variant="primary"
            fullWidth
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>

          <Link href="/feed">
            <Button variant="secondary" fullWidth>
              View Cached Content
            </Button>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-primary/10">
          <p className="text-xs text-text-muted">
            Tip: Course details you've viewed are saved offline. Perfect for checking info on the course!
          </p>
        </div>
      </Card>
    </div>
  );
}

function WifiOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
}
