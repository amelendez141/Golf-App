'use client';

import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';

export default function MessagesPage() {
  return (
    <div className="py-6">
      <Container>
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
            Messages
          </h1>
          <p className="text-text-secondary">
            Connect with your playing partners.
          </p>
        </div>

        {/* Empty State */}
        <Card className="py-12">
          <div className="flex flex-col items-center text-center">
            <div className="text-primary/20 mb-4">
              <MessageIcon className="h-12 w-12" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-primary mb-2">
              No messages yet
            </h3>
            <p className="text-text-muted max-w-md">
              When you join tee times or connect with other players, your conversations will appear here.
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}
