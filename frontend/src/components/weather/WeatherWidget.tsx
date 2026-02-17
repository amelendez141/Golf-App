'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PlayabilityBadge } from './PlayabilityBadge';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  icon: string;
  playabilityScore: number;
  alerts: string[];
}

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  className?: string;
  variant?: 'compact' | 'full';
}

async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(
    `${baseUrl}/api/weather?latitude=${latitude}&longitude=${longitude}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather');
  }

  const data = await response.json();
  return data.data;
}

export function WeatherWidget({
  latitude,
  longitude,
  className,
  variant = 'full',
}: WeatherWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => fetchWeather(latitude, longitude),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-16 bg-secondary rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return null; // Gracefully hide on error
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-sm shadow-md',
          className
        )}
      >
        <WeatherIcon icon={data.icon} className="h-5 w-5 text-accent" />
        <span className="font-medium text-primary">{Math.round(data.temperature)}°F</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card rounded-xl shadow-card p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Main weather info */}
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
            <WeatherIcon icon={data.icon} className="h-8 w-8 text-accent" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{Math.round(data.temperature)}°</span>
              <span className="text-sm text-text-muted">Feels like {Math.round(data.feelsLike)}°</span>
            </div>
            <p className="text-text-secondary">{data.conditions}</p>
          </div>
        </div>

        {/* Playability score */}
        <PlayabilityBadge score={data.playabilityScore} />
      </div>

      {/* Additional details */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-primary/5">
        <div className="text-center">
          <WindIcon className="h-5 w-5 text-text-muted mx-auto mb-1" />
          <p className="text-sm font-medium text-primary">
            {Math.round(data.windSpeed)} mph
          </p>
          <p className="text-xs text-text-muted">{data.windDirection}</p>
        </div>
        <div className="text-center">
          <HumidityIcon className="h-5 w-5 text-text-muted mx-auto mb-1" />
          <p className="text-sm font-medium text-primary">{Math.round(data.humidity)}%</p>
          <p className="text-xs text-text-muted">Humidity</p>
        </div>
        <div className="text-center">
          <ThermometerIcon className="h-5 w-5 text-text-muted mx-auto mb-1" />
          <p className="text-sm font-medium text-primary">{Math.round(data.feelsLike)}°</p>
          <p className="text-xs text-text-muted">Feels Like</p>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="mt-4 p-3 bg-warning/10 rounded-lg">
          <div className="flex items-center gap-2 text-warning">
            <AlertIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{data.alerts[0]}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'sun':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      );
    case 'cloud-rain':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19.5v2m3-2v2m3-2v2" />
        </svg>
      );
    case 'cloud-lightning':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 11l-2 4h3l-2 4" />
        </svg>
      );
    case 'snowflake':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l3 3m-6 0l3-3m0 18l-3-3m6 0l-3 3M3 12h18m-18 0l3 3m0-6l-3 3m18 0l-3-3m0 6l3-3" />
        </svg>
      );
    case 'cloud-fog':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 19h12M8 22h8" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
  }
}

function WindIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  );
}

function HumidityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-3.75 4.5-6 7.5-6 10.5a6 6 0 1012 0c0-3-2.25-6-6-10.5z" />
    </svg>
  );
}

function ThermometerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0a3 3 0 100 6 3 3 0 000-6zm0-12a1.5 1.5 0 00-1.5 1.5v9a3 3 0 103 0v-9A1.5 1.5 0 0012 3z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}
