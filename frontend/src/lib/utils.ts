import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns';
import type { Industry, SkillLevel, TeeTimeSlot } from './types';
import { DATE_FORMATS, getIndustryInfo, getSkillLevelInfo } from './constants';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string, formatType: keyof typeof DATE_FORMATS = 'short') {
  const date = parseISO(dateString);
  return format(date, DATE_FORMATS[formatType]);
}

/**
 * Format a date with smart relative display
 */
export function formatSmartDate(dateString: string) {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  }

  return format(date, DATE_FORMATS.dayTime);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string) {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format time only
 */
export function formatTime(dateString: string) {
  const date = parseISO(dateString);
  return format(date, DATE_FORMATS.time);
}

/**
 * Get user initials from name
 */
export function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase() || '?';
}

/**
 * Get display name from user
 */
export function getDisplayName(firstName: string | null, lastName: string | null): string {
  if (!firstName && !lastName) return 'Anonymous';
  return `${firstName || ''} ${lastName || ''}`.trim();
}

/**
 * Format handicap for display
 */
export function formatHandicap(handicap: number | null): string {
  if (handicap === null) return 'N/A';
  if (handicap === 0) return 'Scratch';
  return handicap.toFixed(1);
}

/**
 * Get industry label
 */
export function getIndustryLabel(industry: Industry | null): string {
  return getIndustryInfo(industry).label;
}

/**
 * Get skill level label
 */
export function getSkillLabel(skillLevel: SkillLevel | null): string {
  return getSkillLevelInfo(skillLevel).label;
}

/**
 * Count open slots in a tee time
 */
export function countOpenSlots(slots: TeeTimeSlot[]): number {
  return slots.filter((slot) => slot.user === null).length;
}

/**
 * Count filled slots in a tee time
 */
export function countFilledSlots(slots: TeeTimeSlot[]): number {
  return slots.filter((slot) => slot.user !== null).length;
}

/**
 * Format slot count display
 */
export function formatSlotCount(slots: TeeTimeSlot[]): string {
  const filled = countFilledSlots(slots);
  const total = slots.length;
  return `${filled}/${total} players`;
}

/**
 * Get first open slot number
 */
export function getFirstOpenSlotNumber(slots: TeeTimeSlot[]): number | null {
  const openSlot = slots.find((slot) => slot.user === null);
  return openSlot?.slotNumber ?? null;
}

/**
 * Check if user is host (slot 1 is typically host)
 */
export function isSlotHost(slot: TeeTimeSlot, hostId?: string): boolean {
  return slot.slotNumber === 1 || (hostId !== undefined && slot.user?.id === hostId);
}

/**
 * Format distance in miles
 */
export function formatDistance(miles: number): string {
  if (miles < 1) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format currency (green fee is in cents)
 */
export function formatGreenFee(cents: number | null): string {
  if (cents === null || cents === 0) return 'Private';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if running on client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running on server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback = ''): string {
  if (isServer()) {
    return process.env[key] || fallback;
  }
  return (process.env[`NEXT_PUBLIC_${key}`] as string) || fallback;
}
