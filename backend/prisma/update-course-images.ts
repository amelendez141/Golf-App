/**
 * Script to update golf course images with high-quality curated URLs
 *
 * Run this script to update existing course images without re-seeding the database.
 * Usage: npx ts-node prisma/update-course-images.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Curated high-quality golf course images from Unsplash
// Using optimized URLs with proper dimensions for fast loading
const GOLF_COURSE_IMAGES: Record<string, string> = {
  // Famous coastal/oceanside courses - Premium imagery
  'Pebble Beach Golf Links': 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop&q=80',
  'Torrey Pines South Course': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80',
  'Spyglass Hill Golf Course': 'https://images.unsplash.com/photo-1600007508509-b68fc7ef4100?w=800&h=600&fit=crop&q=80',
  'The Links at Spanish Bay': 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=600&fit=crop&q=80',
  'Kiawah Island Ocean Course': 'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800&h=600&fit=crop&q=80',
  'Harbour Town Golf Links': 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop&q=80',
  'Pacific Dunes': 'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=600&fit=crop&q=80',
  'Bandon Dunes': 'https://images.unsplash.com/photo-1632435499152-18838be77960?w=800&h=600&fit=crop&q=80',
  'Cabot Cliffs': 'https://images.unsplash.com/photo-1629996925368-2346d7e5d244?w=800&h=600&fit=crop&q=80',
  'Cape Kidnappers': 'https://images.unsplash.com/photo-1558403871-bb6e8167f578?w=800&h=600&fit=crop&q=80',
  'Barnbougle Dunes': 'https://images.unsplash.com/photo-1609277588573-5d2a795d8892?w=800&h=600&fit=crop&q=80',

  // Prestigious championship courses
  'Augusta National Golf Club': 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop&q=80',
  'Pinehurst No. 2': 'https://images.unsplash.com/photo-1591491653056-4e9d563a42cc?w=800&h=600&fit=crop&q=80',
  'TPC Sawgrass Stadium Course': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80',
  'Bethpage Black': 'https://images.unsplash.com/photo-1600007508509-b68fc7ef4100?w=800&h=600&fit=crop&q=80',
  'Shinnecock Hills Golf Club': 'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=600&fit=crop&q=80',
  'Winged Foot Golf Club West': 'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800&h=600&fit=crop&q=80',
  'The Olympic Club Lake Course': 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=600&fit=crop&q=80',
  'Quail Hollow Club': 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop&q=80',
  'East Lake Golf Club': 'https://images.unsplash.com/photo-1591491653056-4e9d563a42cc?w=800&h=600&fit=crop&q=80',
  'Colonial Country Club': 'https://images.unsplash.com/photo-1632435499152-18838be77960?w=800&h=600&fit=crop&q=80',

  // Resort courses
  'Doral Blue Monster': 'https://images.unsplash.com/photo-1558403871-bb6e8167f578?w=800&h=600&fit=crop&q=80',
  'Bay Hill Club & Lodge': 'https://images.unsplash.com/photo-1609277588573-5d2a795d8892?w=800&h=600&fit=crop&q=80',
  'Streamsong Red': 'https://images.unsplash.com/photo-1629996925368-2346d7e5d244?w=800&h=600&fit=crop&q=80',
  'Half Moon Bay Golf Links': 'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800&h=600&fit=crop&q=80',
  'Whistling Straits Straits Course': 'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=600&fit=crop&q=80',
  'Sand Valley Golf Resort': 'https://images.unsplash.com/photo-1632435499152-18838be77960?w=800&h=600&fit=crop&q=80',
  'Kapalua Plantation Course': 'https://images.unsplash.com/photo-1558403871-bb6e8167f578?w=800&h=600&fit=crop&q=80',
  'Mauna Kea Golf Course': 'https://images.unsplash.com/photo-1609277588573-5d2a795d8892?w=800&h=600&fit=crop&q=80',
  "The Coeur d'Alene Resort": 'https://images.unsplash.com/photo-1629996925368-2346d7e5d244?w=800&h=600&fit=crop&q=80',

  // Arizona desert courses
  'TPC Scottsdale Stadium Course': 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop&q=80',
  'Troon North Monument': 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop&q=80',
  'Grayhawk Raptor Course': 'https://images.unsplash.com/photo-1591491653056-4e9d563a42cc?w=800&h=600&fit=crop&q=80',
  'We-Ko-Pa Saguaro': 'https://images.unsplash.com/photo-1600007508509-b68fc7ef4100?w=800&h=600&fit=crop&q=80',
  'Desert Willow Firecliff': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80',

  // Public/Municipal courses
  'TPC Harding Park': 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=600&fit=crop&q=80',
  'Pasatiempo Golf Club': 'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800&h=600&fit=crop&q=80',
  'Erin Hills': 'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=600&fit=crop&q=80',
  'Chambers Bay': 'https://images.unsplash.com/photo-1632435499152-18838be77960?w=800&h=600&fit=crop&q=80',
  'Arcadia Bluffs': 'https://images.unsplash.com/photo-1558403871-bb6e8167f578?w=800&h=600&fit=crop&q=80',
  'Tobacco Road Golf Club': 'https://images.unsplash.com/photo-1609277588573-5d2a795d8892?w=800&h=600&fit=crop&q=80',
  'Rustic Canyon Golf Course': 'https://images.unsplash.com/photo-1629996925368-2346d7e5d244?w=800&h=600&fit=crop&q=80',
  'Whispering Pines Golf Club': 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop&q=80',
  'Austin Country Club': 'https://images.unsplash.com/photo-1591491653056-4e9d563a42cc?w=800&h=600&fit=crop&q=80',
  "Ko'olau Golf Club": 'https://images.unsplash.com/photo-1600007508509-b68fc7ef4100?w=800&h=600&fit=crop&q=80',
};

// Premium generic golf course images for courses not in the mapping
const GENERIC_GOLF_IMAGES = [
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600007508509-b68fc7ef4100?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1632435499152-18838be77960?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1629996925368-2346d7e5d244?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558403871-bb6e8167f578?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1609277588573-5d2a795d8892?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1591491653056-4e9d563a42cc?w=800&h=600&fit=crop&q=80',
];

async function updateCourseImages() {
  console.log('Starting course image update...\n');

  try {
    // Get all courses from the database
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`Found ${courses.length} courses to update.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];

      // Check if we have a specific image for this course
      let newImageUrl = GOLF_COURSE_IMAGES[course.name];

      // If not, use a generic premium image based on index
      if (!newImageUrl) {
        newImageUrl = GENERIC_GOLF_IMAGES[i % GENERIC_GOLF_IMAGES.length];
      }

      // Only update if the image URL is different
      if (course.imageUrl !== newImageUrl) {
        await prisma.course.update({
          where: { id: course.id },
          data: { imageUrl: newImageUrl },
        });
        console.log(`Updated: ${course.name}`);
        updatedCount++;
      } else {
        console.log(`Skipped (already up to date): ${course.name}`);
        skippedCount++;
      }
    }

    console.log('\n--- Summary ---');
    console.log(`Total courses: ${courses.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('\nCourse image update completed successfully!');

  } catch (error) {
    console.error('Error updating course images:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateCourseImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
