'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConditionReport {
  id: string;
  courseId: string;
  greens: number;
  fairways: number;
  bunkers?: number;
  pace?: number;
  notes?: string;
  alerts: string[];
  photoUrl?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface ConditionSummary {
  totalReports: number;
  averageGreens: number | null;
  averageFairways: number | null;
  averageBunkers: number | null;
  activeAlerts: string[];
}

interface CourseConditionsProps {
  courseId: string;
  className?: string;
}

async function fetchConditions(courseId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/api/conditions/${courseId}`);
  if (!response.ok) throw new Error('Failed to fetch conditions');
  return response.json();
}

export function CourseConditions({ courseId, className }: CourseConditionsProps) {
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['conditions', courseId],
    queryFn: () => fetchConditions(courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <div className="h-32 bg-secondary rounded-lg" />
      </Card>
    );
  }

  if (error) {
    return null; // Gracefully hide on error
  }

  const summary: ConditionSummary = data?.data?.summary || {
    totalReports: 0,
    averageGreens: null,
    averageFairways: null,
    averageBunkers: null,
    activeAlerts: [],
  };
  const reports: ConditionReport[] = data?.data?.reports || [];

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-primary">
          Course Conditions
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Report'}
        </Button>
      </div>

      {/* Active Alerts */}
      {summary.activeAlerts.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {summary.activeAlerts.map((alert) => (
            <Badge key={alert} variant="warning" size="sm">
              <AlertIcon className="h-3 w-3 mr-1" />
              {alert}
            </Badge>
          ))}
        </div>
      )}

      {/* Condition Summary */}
      {summary.totalReports > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-secondary rounded-lg">
          <RatingDisplay
            label="Greens"
            value={summary.averageGreens}
            icon={<GreenIcon className="h-4 w-4" />}
          />
          <RatingDisplay
            label="Fairways"
            value={summary.averageFairways}
            icon={<FairwayIcon className="h-4 w-4" />}
          />
          <RatingDisplay
            label="Bunkers"
            value={summary.averageBunkers}
            icon={<BunkerIcon className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Report Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ConditionReportForm
              courseId={courseId}
              onSuccess={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Reports */}
      {reports.length > 0 ? (
        <div className="space-y-3 mt-4">
          <p className="text-xs text-text-muted uppercase tracking-wide">
            Recent Reports ({summary.totalReports} total)
          </p>
          {reports.slice(0, 3).map((report) => (
            <ConditionReportItem key={report.id} report={report} />
          ))}
        </div>
      ) : !showForm && (
        <div className="text-center py-6">
          <p className="text-text-muted text-sm">No condition reports yet</p>
          <Button
            variant="accent"
            size="sm"
            className="mt-2"
            onClick={() => setShowForm(true)}
          >
            Be the first to report
          </Button>
        </div>
      )}
    </Card>
  );
}

// Rating display component
function RatingDisplay({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
}) {
  if (value === null) return null;

  const color =
    value >= 4 ? 'text-success' :
    value >= 3 ? 'text-accent' :
    value >= 2 ? 'text-warning' :
    'text-error';

  return (
    <div className="text-center">
      <div className={cn('flex items-center justify-center gap-1', color)}>
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

// Individual report item
function ConditionReportItem({ report }: { report: ConditionReport }) {
  return (
    <div className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
      <Avatar
        src={report.user.avatarUrl}
        firstName={report.user.firstName}
        lastName={report.user.lastName}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-primary">
            {report.user.firstName} {report.user.lastName}
          </span>
          <span className="text-xs text-text-muted">
            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span>Greens: {report.greens}/5</span>
          <span>Fairways: {report.fairways}/5</span>
          {report.pace && <span>+{report.pace} min pace</span>}
        </div>
        {report.notes && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {report.notes}
          </p>
        )}
      </div>
    </div>
  );
}

// Report submission form
function ConditionReportForm({
  courseId,
  onSuccess,
}: {
  courseId: string;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [greens, setGreens] = useState(3);
  const [fairways, setFairways] = useState(3);
  const [bunkers, setBunkers] = useState(3);
  const [pace, setPace] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const [alerts, setAlerts] = useState<string[]>([]);

  const alertOptions = [
    'Greens Aerated',
    'Cart Path Only',
    'Frost Delay Possible',
    'Wet Conditions',
    'Bunkers Unraked',
  ];

  const mutation = useMutation({
    mutationFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/conditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          greens,
          fairways,
          bunkers,
          pace,
          notes: notes || undefined,
          alerts,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conditions', courseId] });
      onSuccess();
    },
  });

  const toggleAlert = (alert: string) => {
    setAlerts((prev) =>
      prev.includes(alert) ? prev.filter((a) => a !== alert) : [...prev, alert]
    );
  };

  return (
    <div className="p-4 bg-secondary rounded-lg space-y-4 mb-4">
      <h4 className="font-medium text-primary">Submit Condition Report</h4>

      {/* Ratings */}
      <div className="grid grid-cols-3 gap-4">
        <RatingInput label="Greens" value={greens} onChange={setGreens} />
        <RatingInput label="Fairways" value={fairways} onChange={setFairways} />
        <RatingInput label="Bunkers" value={bunkers} onChange={setBunkers} />
      </div>

      {/* Pace */}
      <div>
        <label className="text-sm text-text-secondary block mb-1">
          Pace (minutes over par time)
        </label>
        <input
          type="number"
          min="0"
          max="120"
          value={pace || ''}
          onChange={(e) => setPace(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="e.g., 15"
          className="w-full px-3 py-2 bg-card border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Alerts */}
      <div>
        <label className="text-sm text-text-secondary block mb-2">Alerts</label>
        <div className="flex flex-wrap gap-2">
          {alertOptions.map((alert) => (
            <button
              key={alert}
              onClick={() => toggleAlert(alert)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px]',
                alerts.includes(alert)
                  ? 'bg-warning text-white'
                  : 'bg-card border border-primary/10 text-text-secondary hover:border-warning'
              )}
            >
              {alert}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm text-text-secondary block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional details about course conditions..."
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2 bg-card border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

      <Button
        variant="accent"
        fullWidth
        onClick={() => mutation.mutate()}
        isLoading={mutation.isPending}
      >
        Submit Report
      </Button>
    </div>
  );
}

// Rating input with stars
function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="text-xs text-text-secondary block mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={cn(
              'h-8 w-8 rounded transition-colors min-h-[32px]',
              rating <= value
                ? 'bg-accent text-white'
                : 'bg-card border border-primary/10 text-text-muted hover:border-accent'
            )}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}

// Icons
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function GreenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function FairwayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="6" width="16" height="12" rx="2" />
    </svg>
  );
}

function BunkerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="12" cy="12" rx="8" ry="5" />
    </svg>
  );
}
