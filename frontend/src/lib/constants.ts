import type { Industry, IndustryInfo, SkillLevel, SkillLevelInfo, CourseType } from './types';

export const INDUSTRIES: IndustryInfo[] = [
  { id: 'TECHNOLOGY', label: 'Technology', color: '#8B5CF6', bgClass: 'bg-purple-100 text-purple-800' },
  { id: 'FINANCE', label: 'Finance & Banking', color: '#3B82F6', bgClass: 'bg-blue-100 text-blue-800' },
  { id: 'HEALTHCARE', label: 'Healthcare', color: '#10B981', bgClass: 'bg-emerald-100 text-emerald-800' },
  { id: 'LEGAL', label: 'Legal', color: '#64748B', bgClass: 'bg-slate-100 text-slate-800' },
  { id: 'REAL_ESTATE', label: 'Real Estate', color: '#F59E0B', bgClass: 'bg-amber-100 text-amber-800' },
  { id: 'CONSULTING', label: 'Consulting', color: '#06B6D4', bgClass: 'bg-cyan-100 text-cyan-800' },
  { id: 'MARKETING', label: 'Marketing', color: '#EC4899', bgClass: 'bg-pink-100 text-pink-800' },
  { id: 'SALES', label: 'Sales', color: '#F97316', bgClass: 'bg-orange-100 text-orange-800' },
  { id: 'ENGINEERING', label: 'Engineering', color: '#6366F1', bgClass: 'bg-indigo-100 text-indigo-800' },
  { id: 'EXECUTIVE', label: 'Executive', color: '#1F2937', bgClass: 'bg-gray-100 text-gray-800' },
  { id: 'ENTREPRENEURSHIP', label: 'Entrepreneurship', color: '#DC2626', bgClass: 'bg-red-100 text-red-800' },
  { id: 'OTHER', label: 'Other', color: '#6B7280', bgClass: 'bg-gray-100 text-gray-600' },
] as const;

export const SKILL_LEVELS: SkillLevelInfo[] = [
  { id: 'BEGINNER', label: 'Beginner', handicapRange: '25+', bgClass: 'bg-green-100 text-green-800' },
  { id: 'INTERMEDIATE', label: 'Intermediate', handicapRange: '15-24', bgClass: 'bg-blue-100 text-blue-800' },
  { id: 'ADVANCED', label: 'Advanced', handicapRange: '5-14', bgClass: 'bg-purple-100 text-purple-800' },
  { id: 'EXPERT', label: 'Expert', handicapRange: '0-4', bgClass: 'bg-amber-100 text-amber-800' },
] as const;

export const COURSE_TYPES: Record<CourseType, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  SEMI_PRIVATE: 'Semi-Private',
  RESORT: 'Resort',
  MUNICIPAL: 'Municipal',
} as const;

export const PRICE_LEVEL_LABELS: Record<number, string> = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
} as const;

export const getIndustryInfo = (industry: Industry | null): IndustryInfo => {
  if (!industry) return INDUSTRIES[INDUSTRIES.length - 1];
  return INDUSTRIES.find((i) => i.id === industry) || INDUSTRIES[INDUSTRIES.length - 1];
};

export const getSkillLevelInfo = (skillLevel: SkillLevel | null): SkillLevelInfo => {
  if (!skillLevel) return SKILL_LEVELS[0];
  return SKILL_LEVELS.find((s) => s.id === skillLevel) || SKILL_LEVELS[0];
};

export const SLOT_COUNTS = [2, 3, 4] as const;

export const DEFAULT_MAP_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

export const DEFAULT_MAP_ZOOM = 11;

export const DEFAULT_SEARCH_RADIUS = 50; // miles

export const FEED_PAGE_SIZE = 20;

export const DATE_FORMATS = {
  full: 'EEEE, MMMM d, yyyy',
  short: 'MMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a',
  dayTime: 'EEE, MMM d • h:mm a',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

export const NAV_LINKS = [
  { href: '/feed', label: 'Feed', icon: 'list' },
  { href: '/explore', label: 'Explore', icon: 'map' },
  { href: '/my-times', label: 'My Times', icon: 'calendar' },
  { href: '/connections', label: 'Network', icon: 'users' },
  { href: '/messages', label: 'Messages', icon: 'message' },
] as const;

export const MOBILE_NAV_LINKS = [
  { href: '/feed', label: 'Feed', icon: 'list' },
  { href: '/explore', label: 'Explore', icon: 'map' },
  { href: '/post', label: 'Post', icon: 'plus' },
  { href: '/messages', label: 'Messages', icon: 'message' },
  { href: '/profile', label: 'Profile', icon: 'user' },
] as const;
