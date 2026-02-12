import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const listMessagesSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type ListMessagesInput = z.infer<typeof listMessagesSchema>;
