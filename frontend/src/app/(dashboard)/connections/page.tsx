'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge, IndustryBadge } from '@/components/ui/Badge';
import { MeetingNotes, AddNoteModal } from '@/components/connect';
import { cn } from '@/lib/utils';

type TabType = 'connections' | 'pending' | 'notes';

// Demo data
const demoConnections = [
  {
    id: '1',
    user: {
      id: 'u1',
      firstName: 'Sarah',
      lastName: 'Chen',
      avatarUrl: null,
      company: 'Sequoia Capital',
      jobTitle: 'Partner',
      industry: 'FINANCE',
    },
    connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    mutualRounds: 2,
    lastPlayedCourse: 'Pebble Beach',
  },
  {
    id: '2',
    user: {
      id: 'u2',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      avatarUrl: null,
      company: 'Stripe',
      jobTitle: 'Engineering Lead',
      industry: 'TECHNOLOGY',
    },
    connectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    mutualRounds: 1,
    lastPlayedCourse: 'TPC Harding Park',
  },
  {
    id: '3',
    user: {
      id: 'u3',
      firstName: 'Emily',
      lastName: 'Watson',
      avatarUrl: null,
      company: 'Goldman Sachs',
      jobTitle: 'VP, Private Equity',
      industry: 'FINANCE',
    },
    connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    mutualRounds: 3,
    lastPlayedCourse: 'Olympic Club',
  },
];

const demoPendingRequests = [
  {
    id: 'p1',
    user: {
      id: 'u4',
      firstName: 'David',
      lastName: 'Kim',
      avatarUrl: null,
      company: 'Andreessen Horowitz',
      jobTitle: 'Principal',
      industry: 'FINANCE',
    },
    message: 'Great round at Pebble Beach last week! Would love to connect.',
    courseName: 'Pebble Beach',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const demoNotes: Array<{
  id: string;
  aboutUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    company: string;
    jobTitle: string;
    industry: string;
  };
  content: string;
  tags: string[];
  courseName?: string;
  roundDate?: string;
  createdAt: string;
}> = [
  {
    id: 'n1',
    aboutUser: {
      id: 'u1',
      firstName: 'Sarah',
      lastName: 'Chen',
      avatarUrl: null,
      company: 'Sequoia Capital',
      jobTitle: 'Partner',
      industry: 'FINANCE',
    },
    content:
      'Interested in climate tech investments. Mentioned they are looking for Series A deals in the sustainability space. Follow up about our portfolio company.',
    tags: ['follow-up', 'investor', 'climate-tech'],
    courseName: 'Pebble Beach',
    roundDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    aboutUser: {
      id: 'u2',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      avatarUrl: null,
      company: 'Stripe',
      jobTitle: 'Engineering Lead',
      industry: 'TECHNOLOGY',
    },
    content:
      'Great golfer, 8 handicap. Building out their platform team and mentioned they are hiring senior engineers. Also knows John from our YC batch.',
    tags: ['hire', 'good-contact'],
    courseName: 'TPC Harding Park',
    roundDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [connections] = useState(demoConnections);
  const [pendingRequests, setPendingRequests] = useState(demoPendingRequests);
  const [notes, setNotes] = useState(demoNotes);
  const [addingNoteFor, setAddingNoteFor] = useState<typeof demoConnections[0]['user'] | null>(null);

  const handleAcceptRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    // In production, would also add to connections and call API
  };

  const handleDeclineRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleAddNote = (note: { aboutUserId: string; content: string; tags: string[] }) => {
    const connection = connections.find((c) => c.user.id === note.aboutUserId);
    if (!connection) return;

    const newNote: typeof demoNotes[0] = {
      id: `n${Date.now()}`,
      aboutUser: {
        id: connection.user.id,
        firstName: connection.user.firstName,
        lastName: connection.user.lastName,
        avatarUrl: connection.user.avatarUrl ?? null,
        company: connection.user.company ?? '',
        jobTitle: connection.user.jobTitle ?? '',
        industry: connection.user.industry ?? '',
      },
      content: note.content,
      tags: note.tags,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setAddingNoteFor(null);
  };

  const handleEditNote = (noteId: string, content: string, tags: string[]) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, content, tags } : n))
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'connections', label: 'Connections', count: connections.length },
    { id: 'pending', label: 'Pending', count: pendingRequests.length },
    { id: 'notes', label: 'Meeting Notes', count: notes.length },
  ];

  return (
    <div className="py-6">
      <Container>
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">
            My Network
          </h1>
          <p className="text-text-muted">
            Your golf connections and meeting notes
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-primary/10 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 font-medium text-sm rounded-t-lg transition-colors relative',
                activeTab === tab.id
                  ? 'text-primary bg-secondary'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    'ml-2 px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === tab.id
                      ? 'bg-accent text-white'
                      : 'bg-primary/10 text-text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'connections' && (
            <motion.div
              key="connections"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {connections.length === 0 ? (
                <EmptyState
                  icon={<UsersIcon className="h-12 w-12" />}
                  title="No connections yet"
                  description="Play a round and connect with your playing partners"
                />
              ) : (
                connections.map((connection, index) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ConnectionCard
                      connection={connection}
                      onAddNote={() => setAddingNoteFor(connection.user)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {pendingRequests.length === 0 ? (
                <EmptyState
                  icon={<InboxIcon className="h-12 w-12" />}
                  title="No pending requests"
                  description="New connection requests will appear here"
                />
              ) : (
                pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PendingRequestCard
                      request={request}
                      onAccept={() => handleAcceptRequest(request.id)}
                      onDecline={() => handleDeclineRequest(request.id)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MeetingNotes
                notes={notes}
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Note Modal */}
        <AnimatePresence>
          {addingNoteFor && (
            <AddNoteModal
              player={addingNoteFor}
              onSave={handleAddNote}
              onCancel={() => setAddingNoteFor(null)}
            />
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

interface ConnectionCardProps {
  connection: typeof demoConnections[0];
  onAddNote: () => void;
}

function ConnectionCard({ connection, onAddNote }: ConnectionCardProps) {
  const { user, connectedAt, mutualRounds, lastPlayedCourse } = connection;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar
          src={user.avatarUrl}
          firstName={user.firstName}
          lastName={user.lastName}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-primary">
              {user.firstName} {user.lastName}
            </h3>
            {user.industry && (
              <IndustryBadge industry={user.industry as any} size="sm" />
            )}
          </div>
          {user.jobTitle && user.company && (
            <p className="text-sm text-text-muted truncate">
              {user.jobTitle} at {user.company}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span>{mutualRounds} mutual rounds</span>
            <span>·</span>
            <span>Last: {lastPlayedCourse}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onAddNote}>
            <NotesIcon className="h-4 w-4 mr-1" />
            Note
          </Button>
          <Button variant="primary" size="sm">
            Message
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface PendingRequestCardProps {
  request: typeof demoPendingRequests[0];
  onAccept: () => void;
  onDecline: () => void;
}

function PendingRequestCard({ request, onAccept, onDecline }: PendingRequestCardProps) {
  const { user, message, courseName, requestedAt } = request;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar
          src={user.avatarUrl}
          firstName={user.firstName}
          lastName={user.lastName}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-primary">
              {user.firstName} {user.lastName}
            </h3>
            {user.industry && (
              <IndustryBadge industry={user.industry as any} size="sm" />
            )}
          </div>
          {user.jobTitle && user.company && (
            <p className="text-sm text-text-muted">
              {user.jobTitle} at {user.company}
            </p>
          )}
          {message && (
            <p className="text-sm text-text-secondary mt-2 bg-secondary rounded-lg p-3">
              "{message}"
            </p>
          )}
          <p className="text-xs text-text-muted mt-2">
            {courseName && `From ${courseName} · `}
            {new Date(requestedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-4 pl-14">
        <Button variant="secondary" size="sm" onClick={onDecline}>
          Decline
        </Button>
        <Button variant="primary" size="sm" onClick={onAccept}>
          Accept
        </Button>
      </div>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-text-muted mx-auto mb-4">{icon}</div>
      <h3 className="font-medium text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted">{description}</p>
    </div>
  );
}

// Icons
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );
}

function NotesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
