import { z } from 'zod';
import { CourseType } from '@prisma/client';

export const searchCoursesSchema = z.object({
  query: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(200).default(50),
  courseType: z.nativeEnum(CourseType).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type SearchCoursesInput = z.infer<typeof searchCoursesSchema>;

export const courseIdSchema = z.object({
  id: z.string().cuid(),
});

export const courseSlugSchema = z.object({
  slug: z.string().min(1),
});
