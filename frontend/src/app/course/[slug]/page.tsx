'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCourseBySlug } from '@/hooks/useCourseSearch';
import { PRICE_LEVEL_LABELS, COURSE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { DirectionsButton, CourseConditions } from '@/components/course';
import { WeatherWidget } from '@/components/weather';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { data: course, isLoading, error } = useCourseBySlug(resolvedParams.slug);

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <Container className="py-12">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">
              Course Not Found
            </h1>
            <p className="text-text-muted mb-6">
              This course may not exist or has been removed.
            </p>
            <Link href="/explore">
              <Button>Explore Courses</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Course info overlay */}
        <Container className="absolute bottom-0 left-0 right-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
                {course.name}
              </h1>
              <p className="text-white/80 flex items-center gap-2">
                <LocationIcon className="h-5 w-5" />
                {course.address}, {course.city}, {course.state} {course.zipCode}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="lg">
                {COURSE_TYPES[course.courseType]}
              </Badge>
              <Badge variant="secondary" size="lg">
                {PRICE_LEVEL_LABELS[course.priceLevel]}
              </Badge>
              {course.rating > 0 && (
                <Badge variant="accent" size="lg" className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4" />
                  {course.rating.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Stats */}
            <Card>
              <h2 className="font-serif text-lg font-semibold text-primary mb-4">
                Course Details
              </h2>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{course.holes}</p>
                  <p className="text-sm text-text-muted">Holes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{course.par}</p>
                  <p className="text-sm text-text-muted">Par</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {course.yardage.toLocaleString()}
                  </p>
                  <p className="text-sm text-text-muted">Yards</p>
                </div>
              </div>
            </Card>

            {/* Description */}
            {course.description && (
              <Card>
                <h2 className="font-serif text-lg font-semibold text-primary mb-3">
                  About
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  {course.description}
                </p>
              </Card>
            )}

            {/* Course Conditions */}
            <CourseConditions courseId={course.id} />

            {/* Amenities */}
            {course.amenities.length > 0 && (
              <Card>
                <h2 className="font-serif text-lg font-semibold text-primary mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {course.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <CheckIcon className="h-4 w-4 text-success" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Upcoming Tee Times */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold text-primary">
                  Available Tee Times
                </h2>
                <Link href={`/feed?courseId=${course.id}`}>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="text-center py-8">
                <p className="text-text-muted">
                  No tee times posted for this course yet.
                </p>
                <Link href="/post">
                  <Button variant="accent" size="sm" className="mt-4">
                    Be the first to post
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <WeatherWidget
              latitude={course.latitude}
              longitude={course.longitude}
            />

            {/* Contact Card */}
            <Card>
              <h3 className="font-serif text-lg font-semibold text-primary mb-4">
                Contact
              </h3>
              <div className="space-y-3">
                {course.phone && (
                  <a
                    href={`tel:${course.phone}`}
                    className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    {course.phone}
                  </a>
                )}
                {course.website && (
                  <a
                    href={course.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
                  >
                    <GlobeIcon className="h-5 w-5" />
                    Visit Website
                  </a>
                )}
              </div>
            </Card>

            {/* Map Card */}
            <Card>
              <h3 className="font-serif text-lg font-semibold text-primary mb-4">
                Location
              </h3>
              <div className="h-48 rounded-lg bg-secondary flex items-center justify-center mb-3">
                <span className="text-text-muted text-sm">Map preview</span>
              </div>
              <DirectionsButton
                latitude={course.latitude}
                longitude={course.longitude}
                courseName={course.name}
                address={`${course.address}, ${course.city}, ${course.state} ${course.zipCode}`}
                fullWidth
                size="sm"
              />
            </Card>

            {/* Reviews Summary */}
            {course.reviewCount > 0 && (
              <Card>
                <h3 className="font-serif text-lg font-semibold text-primary mb-4">
                  Reviews
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {course.rating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={cn(
                            'h-5 w-5',
                            star <= Math.round(course.rating)
                              ? 'text-accent'
                              : 'text-secondary-300'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-text-muted">
                      {course.reviewCount} reviews
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <Skeleton className="h-64 md:h-96 w-full rounded-none" />
      <Container className="py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    </div>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
