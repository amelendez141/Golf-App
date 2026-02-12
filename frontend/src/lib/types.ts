// Enums matching backend Prisma schema
export type Industry =
  | 'TECHNOLOGY'
  | 'FINANCE'
  | 'HEALTHCARE'
  | 'LEGAL'
  | 'REAL_ESTATE'
  | 'CONSULTING'
  | 'MARKETING'
  | 'SALES'
  | 'ENGINEERING'
  | 'EXECUTIVE'
  | 'ENTREPRENEURSHIP'
  | 'OTHER';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type TeeTimeStatus = 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';

export type CourseType = 'PUBLIC' | 'PRIVATE' | 'SEMI_PRIVATE' | 'RESORT' | 'MUNICIPAL';

export type NotificationType =
  | 'TEE_TIME_JOINED'
  | 'TEE_TIME_LEFT'
  | 'TEE_TIME_CANCELLED'
  | 'TEE_TIME_REMINDER'
  | 'NEW_MESSAGE'
  | 'SLOT_AVAILABLE'
  | 'MATCH_FOUND';

// User types
export interface User {
  id: string;
  clerkId?: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  industry: Industry | null;
  company: string | null;
  jobTitle: string | null;
  bio: string | null;
  handicap: number | null;
  skillLevel: SkillLevel | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  searchRadius: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  industry: Industry | null;
  company: string | null;
  jobTitle: string | null;
  bio: string | null;
  handicap: number | null;
  skillLevel: SkillLevel | null;
  city: string | null;
  state: string | null;
}

// Course types
export interface Course {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  courseType: CourseType;
  holes: number;
  par: number | null;
  rating: number | null;
  slope: number | null;
  yardage: number | null;
  greenFee: number | null; // in cents
  amenities: string[];
  imageUrl: string | null;
  description: string | null;
  distance?: number; // miles, when queried by location
  isFavorited?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Tee Time Slot
export interface TeeTimeSlot {
  slotNumber: number;
  user: UserPublic | null;
  joinedAt: string | null;
}

// Tee Time types
export interface TeeTime {
  id: string;
  dateTime: string;
  totalSlots: number;
  filledSlots: number;
  availableSlots: number;
  industryPreference: Industry[];
  skillPreference: SkillLevel[];
  notes: string | null;
  status: TeeTimeStatus;
  createdAt: string;
  host: UserPublic;
  course: Course;
  slots: TeeTimeSlot[];
  matchScore?: number; // on recommended endpoint
}

export interface TeeTimeCreateInput {
  courseId: string;
  dateTime: string;
  totalSlots?: number;
  industryPreference?: Industry[];
  skillPreference?: SkillLevel[];
  notes?: string;
}

// Message types
export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: UserPublic;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

// Feed filters
export interface FeedFilters {
  courseId?: string;
  hostId?: string;
  status?: TeeTimeStatus;
  industry?: Industry;
  skillLevel?: SkillLevel;
  latitude?: number;
  longitude?: number;
  radius?: number;
  fromDate?: string;
  toDate?: string;
  hasAvailableSlots?: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    nextCursor: string | null;
    hasMore: boolean;
  };
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };
}

// Industry display info
export interface IndustryInfo {
  id: Industry;
  label: string;
  color: string;
  bgClass: string;
}

// Skill level display info
export interface SkillLevelInfo {
  id: SkillLevel;
  label: string;
  handicapRange: string;
  bgClass: string;
}

// WebSocket types
export interface WSMessage {
  type:
    | 'connected'
    | 'subscribed'
    | 'unsubscribed'
    | 'pong'
    | 'TEE_TIME_CREATED'
    | 'SLOT_JOINED'
    | 'SLOT_LEFT'
    | 'TEE_TIME_CANCELLED'
    | 'MESSAGE_SENT'
    | 'TEE_TIME_UPDATED'
    | 'error';
  payload?: unknown;
  timestamp?: string;
  correlationId?: string;
  userId?: string;
  message?: string;
  room?: string;
  code?: string;
}

// Map types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  course: Course;
  openSlots: number;
  teeTimeCount: number;
}
