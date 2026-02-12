import { z } from 'zod';

export const listNotificationsSchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;

export const notificationIdSchema = z.object({
  id: z.string().cuid(),
});
