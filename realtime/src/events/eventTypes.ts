import { z } from 'zod';

// Base event schema
const baseEventSchema = z.object({
  timestamp: z.string().datetime(),
  correlationId: z.string().uuid().optional(),
});

// TEE_TIME_CREATED event
export const teeTimeCreatedSchema = baseEventSchema.extend({
  type: z.literal('TEE_TIME_CREATED'),
  payload: z.object({
    teeTimeId: z.string().uuid(),
    hostId: z.string().uuid(),
    courseId: z.string().uuid(),
    dateTime: z.string().datetime(),
    totalSlots: z.number().int().min(2).max(4),
    industryPreference: z.string().nullable().optional(),
    skillLevel: z.string(),
    notes: z.string().nullable().optional(),
  }),
});

// SLOT_JOINED event
export const slotJoinedSchema = baseEventSchema.extend({
  type: z.literal('SLOT_JOINED'),
  payload: z.object({
    teeTimeId: z.string().uuid(),
    slotId: z.string().uuid(),
    userId: z.string().uuid(),
    slotNumber: z.number().int().min(1).max(4),
    hostId: z.string().uuid(),
    remainingSlots: z.number().int().min(0),
  }),
});

// SLOT_LEFT event
export const slotLeftSchema = baseEventSchema.extend({
  type: z.literal('SLOT_LEFT'),
  payload: z.object({
    teeTimeId: z.string().uuid(),
    slotId: z.string().uuid(),
    userId: z.string().uuid(),
    slotNumber: z.number().int().min(1).max(4),
    hostId: z.string().uuid(),
    openSlots: z.number().int().min(1),
  }),
});

// TEE_TIME_CANCELLED event
export const teeTimeCancelledSchema = baseEventSchema.extend({
  type: z.literal('TEE_TIME_CANCELLED'),
  payload: z.object({
    teeTimeId: z.string().uuid(),
    hostId: z.string().uuid(),
    affectedUserIds: z.array(z.string().uuid()),
    reason: z.string().optional(),
  }),
});

// MESSAGE_SENT event
export const messageSentSchema = baseEventSchema.extend({
  type: z.literal('MESSAGE_SENT'),
  payload: z.object({
    messageId: z.string().uuid(),
    teeTimeId: z.string().uuid(),
    senderId: z.string().uuid(),
    senderName: z.string(),
    content: z.string(),
    participantIds: z.array(z.string().uuid()),
  }),
});

// TEE_TIME_UPDATED event
export const teeTimeUpdatedSchema = baseEventSchema.extend({
  type: z.literal('TEE_TIME_UPDATED'),
  payload: z.object({
    teeTimeId: z.string().uuid(),
    hostId: z.string().uuid(),
    changes: z.record(z.unknown()),
    participantIds: z.array(z.string().uuid()),
  }),
});

// Union of all event types
export const eventSchema = z.discriminatedUnion('type', [
  teeTimeCreatedSchema,
  slotJoinedSchema,
  slotLeftSchema,
  teeTimeCancelledSchema,
  messageSentSchema,
  teeTimeUpdatedSchema,
]);

// Type exports
export type TeeTimeCreatedEvent = z.infer<typeof teeTimeCreatedSchema>;
export type SlotJoinedEvent = z.infer<typeof slotJoinedSchema>;
export type SlotLeftEvent = z.infer<typeof slotLeftSchema>;
export type TeeTimeCancelledEvent = z.infer<typeof teeTimeCancelledSchema>;
export type MessageSentEvent = z.infer<typeof messageSentSchema>;
export type TeeTimeUpdatedEvent = z.infer<typeof teeTimeUpdatedSchema>;

export type LinkUpEvent = z.infer<typeof eventSchema>;

// Event type constants
export const EVENT_TYPES = {
  TEE_TIME_CREATED: 'TEE_TIME_CREATED',
  SLOT_JOINED: 'SLOT_JOINED',
  SLOT_LEFT: 'SLOT_LEFT',
  TEE_TIME_CANCELLED: 'TEE_TIME_CANCELLED',
  MESSAGE_SENT: 'MESSAGE_SENT',
  TEE_TIME_UPDATED: 'TEE_TIME_UPDATED',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
