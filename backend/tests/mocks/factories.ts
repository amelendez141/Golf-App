/**
 * Test Data Factories
 *
 * This module provides factory functions for creating test data objects.
 * These factories create valid, consistent test data for all model types.
 */

import type {
  User,
  Course,
  TeeTime,
  TeeTimeSlot,
  Industry,
  SkillLevel,
  TeeTimeStatus,
  CourseType,
} from '@prisma/client';
import type { TeeTimeWithRelations } from '../../src/repositories/teeTimeRepository';
import type { CourseWithDistance } from '../../src/repositories/courseRepository';

// Counter for generating unique IDs
let idCounter = 0;
const generateId = () => `test-id-${++idCounter}`;
const generateClerkId = () => `clerk-${++idCounter}`;

/**
 * Reset ID counter between test suites
 */
export function resetIdCounter() {
  idCounter = 0;
}

/**
 * User Factory
 */
export interface CreateUserOptions extends Partial<User> {}

export function createMockUser(overrides: CreateUserOptions = {}): User {
  const id = overrides.id ?? generateId();
  return {
    id,
    clerkId: overrides.clerkId ?? generateClerkId(),
    email: overrides.email ?? `user-${id}@example.com`,
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
    avatarUrl: overrides.avatarUrl ?? null,
    industry: overrides.industry ?? ('TECHNOLOGY' as Industry),
    company: overrides.company ?? 'Test Corp',
    jobTitle: overrides.jobTitle ?? 'Engineer',
    bio: overrides.bio ?? null,
    handicap: overrides.handicap ?? 15,
    skillLevel: overrides.skillLevel ?? ('INTERMEDIATE' as SkillLevel),
    latitude: overrides.latitude ?? 37.7749,
    longitude: overrides.longitude ?? -122.4194,
    city: overrides.city ?? 'San Francisco',
    state: overrides.state ?? 'CA',
    searchRadius: overrides.searchRadius ?? 50,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  };
}

/**
 * Create multiple users with different industries
 */
export function createMockUsers(count: number): User[] {
  const industries: Industry[] = [
    'TECHNOLOGY',
    'FINANCE',
    'HEALTHCARE',
    'LEGAL',
    'CONSULTING',
  ];

  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      firstName: `User${i + 1}`,
      industry: industries[i % industries.length],
    })
  );
}

/**
 * Course Factory
 */
export interface CreateCourseOptions extends Partial<Course> {}

export function createMockCourse(overrides: CreateCourseOptions = {}): Course {
  const id = overrides.id ?? generateId();
  const name = overrides.name ?? `Test Golf Course ${id}`;
  return {
    id,
    name,
    slug: overrides.slug ?? name.toLowerCase().replace(/\s+/g, '-'),
    address: overrides.address ?? '123 Golf Lane',
    city: overrides.city ?? 'San Francisco',
    state: overrides.state ?? 'CA',
    zipCode: overrides.zipCode ?? '94102',
    country: overrides.country ?? 'USA',
    latitude: overrides.latitude ?? 37.7749,
    longitude: overrides.longitude ?? -122.4194,
    phone: overrides.phone ?? '555-0100',
    website: overrides.website ?? 'https://testgolf.com',
    courseType: overrides.courseType ?? ('PUBLIC' as CourseType),
    holes: overrides.holes ?? 18,
    par: overrides.par ?? 72,
    rating: overrides.rating ?? 71.5,
    slope: overrides.slope ?? 125,
    yardage: overrides.yardage ?? 6800,
    greenFee: overrides.greenFee ?? 7500, // $75.00 in cents
    amenities: overrides.amenities ?? ['Driving Range', 'Pro Shop', 'Restaurant'],
    imageUrl: overrides.imageUrl ?? null,
    description: overrides.description ?? 'A beautiful test golf course',
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  };
}

/**
 * Create a course with distance (for search results)
 */
export function createMockCourseWithDistance(
  overrides: CreateCourseOptions & { distance?: number } = {}
): CourseWithDistance {
  const course = createMockCourse(overrides);
  return {
    ...course,
    distance: overrides.distance ?? 5.5,
  };
}

/**
 * TeeTime Factory
 */
export interface CreateTeeTimeOptions extends Partial<TeeTime> {}

export function createMockTeeTime(overrides: CreateTeeTimeOptions = {}): TeeTime {
  const id = overrides.id ?? generateId();
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id,
    hostId: overrides.hostId ?? generateId(),
    courseId: overrides.courseId ?? generateId(),
    dateTime: overrides.dateTime ?? tomorrow,
    totalSlots: overrides.totalSlots ?? 4,
    industryPreference: overrides.industryPreference ?? [],
    skillPreference: overrides.skillPreference ?? [],
    notes: overrides.notes ?? null,
    status: overrides.status ?? ('OPEN' as TeeTimeStatus),
    version: overrides.version ?? 0,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

/**
 * TeeTimeSlot Factory
 */
export interface CreateTeeTimeSlotOptions extends Partial<TeeTimeSlot> {}

export function createMockTeeTimeSlot(
  overrides: CreateTeeTimeSlotOptions = {}
): TeeTimeSlot {
  const id = overrides.id ?? generateId();
  return {
    id,
    teeTimeId: overrides.teeTimeId ?? generateId(),
    userId: overrides.userId ?? null,
    slotNumber: overrides.slotNumber ?? 1,
    joinedAt: overrides.joinedAt ?? null,
  };
}

/**
 * TeeTimeWithRelations Factory
 */
export interface CreateTeeTimeWithRelationsOptions {
  teeTime?: CreateTeeTimeOptions;
  host?: CreateUserOptions;
  course?: CreateCourseOptions;
  slots?: CreateTeeTimeSlotOptions[];
  filledSlots?: number;
}

export function createMockTeeTimeWithRelations(
  options: CreateTeeTimeWithRelationsOptions = {}
): TeeTimeWithRelations {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const host = createMockUser(options.host ?? {});
  const course = createMockCourse(options.course ?? {});

  const teeTimeBase = createMockTeeTime({
    hostId: host.id,
    courseId: course.id,
    dateTime: tomorrow,
    ...options.teeTime,
  });

  // Create slots
  const totalSlots = teeTimeBase.totalSlots;
  const filledCount = options.filledSlots ?? 1; // Host fills slot 1 by default

  let slots: (TeeTimeSlot & {
    user?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      industry: string | null;
      handicap: number | null;
    } | null;
  })[];

  if (options.slots) {
    slots = options.slots.map((slotOpts) => ({
      ...createMockTeeTimeSlot({
        teeTimeId: teeTimeBase.id,
        ...slotOpts,
      }),
      user: slotOpts.userId
        ? {
            id: slotOpts.userId,
            firstName: 'Slot',
            lastName: 'User',
            avatarUrl: null,
            industry: 'TECHNOLOGY',
            handicap: 15,
          }
        : null,
    }));
  } else {
    slots = Array.from({ length: totalSlots }, (_, i) => {
      const slotNumber = i + 1;
      const isHost = slotNumber === 1;
      const isFilled = slotNumber <= filledCount;

      return {
        id: `slot-${teeTimeBase.id}-${slotNumber}`,
        teeTimeId: teeTimeBase.id,
        slotNumber,
        userId: isFilled ? (isHost ? host.id : generateId()) : null,
        joinedAt: isFilled ? now : null,
        user: isFilled
          ? {
              id: isHost ? host.id : generateId(),
              firstName: isHost ? host.firstName : `Player${slotNumber}`,
              lastName: isHost ? host.lastName : 'User',
              avatarUrl: null,
              industry: host.industry,
              handicap: host.handicap,
            }
          : null,
      };
    });
  }

  return {
    ...teeTimeBase,
    host: {
      id: host.id,
      firstName: host.firstName,
      lastName: host.lastName,
      avatarUrl: host.avatarUrl,
      industry: host.industry,
      handicap: host.handicap,
    },
    course: {
      id: course.id,
      name: course.name,
      slug: course.slug,
      city: course.city,
      state: course.state,
      latitude: course.latitude,
      longitude: course.longitude,
    },
    slots,
    _count: {
      slots: slots.filter((s) => s.userId !== null).length,
    },
  } as TeeTimeWithRelations;
}

/**
 * Create multiple tee times with varying characteristics
 */
export function createMockTeeTimes(
  count: number,
  baseOptions: CreateTeeTimeWithRelationsOptions = {}
): TeeTimeWithRelations[] {
  const now = new Date();

  return Array.from({ length: count }, (_, i) => {
    const hoursOffset = (i + 1) * 24; // Each tee time is a day apart
    const dateTime = new Date(now.getTime() + hoursOffset * 60 * 60 * 1000);

    return createMockTeeTimeWithRelations({
      ...baseOptions,
      teeTime: {
        dateTime,
        ...baseOptions.teeTime,
      },
    });
  });
}

/**
 * Industry affinity groups for testing matching
 */
export const INDUSTRY_AFFINITIES: Record<Industry, Industry[]> = {
  TECHNOLOGY: ['ENGINEERING', 'ENTREPRENEURSHIP', 'CONSULTING'],
  FINANCE: ['CONSULTING', 'LEGAL', 'REAL_ESTATE'],
  HEALTHCARE: ['CONSULTING', 'LEGAL'],
  LEGAL: ['FINANCE', 'REAL_ESTATE', 'HEALTHCARE'],
  REAL_ESTATE: ['FINANCE', 'LEGAL', 'SALES'],
  CONSULTING: ['TECHNOLOGY', 'FINANCE', 'EXECUTIVE'],
  MARKETING: ['SALES', 'TECHNOLOGY', 'ENTREPRENEURSHIP'],
  SALES: ['MARKETING', 'REAL_ESTATE', 'ENTREPRENEURSHIP'],
  ENGINEERING: ['TECHNOLOGY', 'CONSULTING'],
  EXECUTIVE: ['CONSULTING', 'ENTREPRENEURSHIP', 'FINANCE'],
  ENTREPRENEURSHIP: ['TECHNOLOGY', 'SALES', 'MARKETING'],
  OTHER: [],
};

/**
 * Skill level order for testing skill matching
 */
export const SKILL_LEVEL_ORDER: SkillLevel[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
];
