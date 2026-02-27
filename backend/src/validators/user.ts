import { z } from 'zod';
import { Industry, SkillLevel } from '@prisma/client';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional().nullable(),
  lastName: z.string().min(1).max(100).optional().nullable(),
  industry: z.nativeEnum(Industry).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  jobTitle: z.string().max(200).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  handicap: z.number().min(-10).max(54).optional().nullable(),
  skillLevel: z.nativeEnum(SkillLevel).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  searchRadius: z.number().min(5).max(200).optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
