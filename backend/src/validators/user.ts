import { z } from 'zod';
import { Industry, SkillLevel } from '@prisma/client';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  industry: z.nativeEnum(Industry).optional(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  handicap: z.number().min(-10).max(54).optional(),
  skillLevel: z.nativeEnum(SkillLevel).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  searchRadius: z.number().min(5).max(200).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
