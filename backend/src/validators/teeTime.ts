import { z } from 'zod';
import { Industry, SkillLevel, TeeTimeStatus } from '@prisma/client';

export const createTeeTimeSchema = z.object({
  courseId: z.string().cuid(),
  dateTime: z.string().datetime().refine(
    (dt) => new Date(dt) > new Date(),
    { message: 'Tee time must be in the future' }
  ),
  totalSlots: z.number().int().min(2).max(4).default(4),
  industryPreference: z.array(z.nativeEnum(Industry)).default([]),
  skillPreference: z.array(z.nativeEnum(SkillLevel)).default([]),
  notes: z.string().max(500).optional(),
});

export type CreateTeeTimeInput = z.infer<typeof createTeeTimeSchema>;

export const updateTeeTimeSchema = z.object({
  dateTime: z.string().datetime().refine(
    (dt) => new Date(dt) > new Date(),
    { message: 'Tee time must be in the future' }
  ).optional(),
  totalSlots: z.number().int().min(2).max(4).optional(),
  industryPreference: z.array(z.nativeEnum(Industry)).optional(),
  skillPreference: z.array(z.nativeEnum(SkillLevel)).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum([TeeTimeStatus.OPEN, TeeTimeStatus.CANCELLED]).optional(),
});

export type UpdateTeeTimeInput = z.infer<typeof updateTeeTimeSchema>;

export const listTeeTimesSchema = z.object({
  courseId: z.string().cuid().optional(),
  hostId: z.string().cuid().optional(),
  status: z.nativeEnum(TeeTimeStatus).optional(),
  industry: z.nativeEnum(Industry).optional(),
  skillLevel: z.nativeEnum(SkillLevel).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(200).default(50),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  hasAvailableSlots: z.coerce.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ListTeeTimesInput = z.infer<typeof listTeeTimesSchema>;

export const teeTimeIdSchema = z.object({
  id: z.string().cuid(),
});

export const joinTeeTimeSchema = z.object({
  slotNumber: z.number().int().min(1).max(4).optional(),
});

export type JoinTeeTimeInput = z.infer<typeof joinTeeTimeSchema>;
