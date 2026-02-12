'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickReply {
  id: string;
  label: string;
  message: string;
  icon?: React.ReactNode;
}

interface QuickRepliesProps {
  onSelect: (message: string) => void;
  className?: string;
}

const quickReplies: QuickReply[] = [
  {
    id: 'on-my-way',
    label: 'On my way!',
    message: "I'm on my way to the course!",
    icon: <CarIcon className="h-4 w-4" />,
  },
  {
    id: 'here',
    label: "I'm here",
    message: "I've arrived at the course!",
    icon: <LocationIcon className="h-4 w-4" />,
  },
  {
    id: 'running-late',
    label: 'Running late',
    message: "Running a few minutes late, be there soon!",
    icon: <ClockIcon className="h-4 w-4" />,
  },
  {
    id: 'see-you-soon',
    label: 'See you soon!',
    message: 'Looking forward to playing with you all!',
    icon: <WaveIcon className="h-4 w-4" />,
  },
];

export function QuickReplies({ onSelect, className }: QuickRepliesProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {quickReplies.map((reply, index) => (
        <motion.button
          key={reply.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(reply.message)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-full',
            'bg-secondary hover:bg-secondary-300 dark:hover:bg-secondary-500',
            'text-sm font-medium text-text-secondary hover:text-primary',
            'border border-primary/10 hover:border-primary/20',
            'transition-all duration-200',
            'min-h-[44px]' // Touch target
          )}
        >
          {reply.icon}
          {reply.label}
        </motion.button>
      ))}
    </div>
  );
}

// Pre-round questions
interface PreRoundQuestionProps {
  onSelect: (question: string) => void;
  className?: string;
}

const preRoundQuestions = [
  {
    id: 'walking',
    label: 'Walking or riding?',
    question: "Hey everyone, are we walking or taking carts today?",
  },
  {
    id: 'tees',
    label: 'What tees?',
    question: "Which tees is everyone planning to play from?",
  },
  {
    id: 'range',
    label: 'Hitting the range?',
    question: "Anyone want to hit the range before we tee off?",
  },
  {
    id: 'drinks',
    label: 'Post-round drinks?',
    question: "Anyone interested in grabbing a drink at the clubhouse after the round?",
  },
];

export function PreRoundQuestions({ onSelect, className }: PreRoundQuestionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs text-text-muted uppercase tracking-wide">Quick Questions</p>
      <div className="flex flex-wrap gap-2">
        {preRoundQuestions.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.question)}
            className={cn(
              'inline-flex items-center px-3 py-2 rounded-full',
              'bg-accent/10 hover:bg-accent/20',
              'text-sm font-medium text-accent',
              'transition-all duration-200',
              'min-h-[44px]' // Touch target
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.992-1.992a2.999 2.999 0 00-2.121-.879H5.25A2.25 2.25 0 003 11.25v5.625c0 .621.504 1.125 1.125 1.125" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15" />
    </svg>
  );
}
