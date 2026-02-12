'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
}

interface MeetingNote {
  id: string;
  aboutUser: Player;
  content: string;
  tags: string[];
  courseName?: string;
  roundDate?: string;
  createdAt: string;
}

interface MeetingNotesProps {
  notes: MeetingNote[];
  onAddNote: (note: { aboutUserId: string; content: string; tags: string[] }) => void;
  onEditNote: (noteId: string, content: string, tags: string[]) => void;
  onDeleteNote: (noteId: string) => void;
  className?: string;
}

const SUGGESTED_TAGS = [
  'follow-up',
  'potential-client',
  'good-contact',
  'mentor',
  'investor',
  'partner',
  'referral',
  'hire',
];

export function MeetingNotes({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  className,
}: MeetingNotesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === '' ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${note.aboutUser.firstName} ${note.aboutUser.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      note.aboutUser.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === null || note.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-primary">
            Meeting Notes
          </h2>
          <p className="text-sm text-text-muted">
            Private notes about your golf connections
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, names, companies..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary/10 bg-secondary text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedTag === null
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-text-secondary hover:bg-primary/10'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedTag === tag
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-text-secondary hover:bg-primary/10'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <NotesIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">
                {searchQuery || selectedTag
                  ? 'No notes match your search'
                  : 'No meeting notes yet'}
              </p>
              <p className="text-sm text-text-muted mt-1">
                Add notes after rounds to remember important connections
              </p>
            </motion.div>
          ) : (
            filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <NoteCard
                  note={note}
                  onEdit={() => setEditingNote(note)}
                  onDelete={() => onDeleteNote(note.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingNote && (
          <NoteEditModal
            note={editingNote}
            onSave={(content, tags) => {
              onEditNote(editingNote.id, content, tags);
              setEditingNote(null);
            }}
            onCancel={() => setEditingNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface NoteCardProps {
  note: MeetingNote;
  onEdit: () => void;
  onDelete: () => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-4">
        <Avatar
          src={note.aboutUser.avatarUrl}
          firstName={note.aboutUser.firstName}
          lastName={note.aboutUser.lastName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary">
                {note.aboutUser.firstName} {note.aboutUser.lastName}
              </span>
              {note.aboutUser.company && (
                <span className="text-sm text-text-muted">
                  · {note.aboutUser.company}
                </span>
              )}
            </div>
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1"
                >
                  <button
                    onClick={onEdit}
                    className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-colors"
                    aria-label="Edit note"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1.5 rounded-lg hover:bg-error/5 text-text-muted hover:text-error transition-colors"
                    aria-label="Delete note"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(note.courseName || note.roundDate) && (
            <p className="text-xs text-text-muted mb-2">
              {note.courseName && `${note.courseName}`}
              {note.courseName && note.roundDate && ' · '}
              {note.roundDate && new Date(note.roundDate).toLocaleDateString()}
            </p>
          )}

          <p className="text-text-secondary whitespace-pre-wrap">{note.content}</p>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-text-muted mt-3">
            Added {new Date(note.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface NoteEditModalProps {
  note: MeetingNote;
  onSave: (content: string, tags: string[]) => void;
  onCancel: () => void;
}

function NoteEditModal({ note, onSave, onCancel }: NoteEditModalProps) {
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

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
        className="bg-card rounded-xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-3">
          <Avatar
            src={note.aboutUser.avatarUrl}
            firstName={note.aboutUser.firstName}
            lastName={note.aboutUser.lastName}
            size="lg"
          />
          <div>
            <h3 className="font-serif font-semibold text-primary">
              Note about {note.aboutUser.firstName}
            </h3>
            {note.aboutUser.company && (
              <p className="text-sm text-text-muted">{note.aboutUser.company}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Note Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-primary/10 bg-secondary p-3 text-sm text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            rows={5}
            placeholder="Add your notes about this person..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-accent/70"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              placeholder="Add a tag..."
              className="flex-1 rounded-lg border border-primary/10 bg-secondary px-3 py-2 text-sm text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddTag(tagInput)}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-xs text-text-muted mr-1">Suggestions:</span>
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="px-2 py-0.5 rounded-full bg-secondary text-text-muted text-xs hover:bg-primary/10 hover:text-text-secondary transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => onSave(content, tags)}
            disabled={!content.trim()}
          >
            Save Note
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Add Note Modal for creating new notes
interface AddNoteModalProps {
  player: Player;
  courseName?: string;
  teeTimeId?: string;
  onSave: (note: { aboutUserId: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
}

export function AddNoteModal({
  player,
  courseName,
  teeTimeId,
  onSave,
  onCancel,
}: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

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
        className="bg-card rounded-xl p-6 max-w-lg w-full space-y-4"
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
              Add Note about {player.firstName}
            </h3>
            {courseName && (
              <p className="text-sm text-text-muted">{courseName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Note Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-primary/10 bg-secondary p-3 text-sm text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            rows={4}
            placeholder="What do you want to remember about this person?"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-accent/70"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="px-2 py-1 rounded-full bg-secondary text-text-muted text-xs hover:bg-primary/10 hover:text-text-secondary transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => onSave({ aboutUserId: player.id, content, tags })}
            disabled={!content.trim()}
          >
            Save Note
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
