import { PrismaClient, Industry, SkillLevel, CourseType, TeeTimeStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

// Realistic user data
const FIRST_NAMES = [
  'James', 'Michael', 'Robert', 'David', 'William', 'John', 'Richard', 'Thomas', 'Christopher', 'Daniel',
  'Matthew', 'Anthony', 'Joseph', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth',
  'Emily', 'Emma', 'Olivia', 'Sophia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper',
  'Evelyn', 'Abigail', 'Elizabeth', 'Sofia', 'Victoria', 'Scarlett', 'Madison', 'Aria', 'Grace', 'Chloe',
  'Jennifer', 'Sarah', 'Jessica', 'Ashley', 'Amanda', 'Stephanie', 'Nicole', 'Samantha', 'Katherine', 'Christine'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez',
  'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young',
  'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill',
  'Chen', 'Kim', 'Patel', 'Singh', 'Wilson', 'Campbell', 'Murphy', 'Sullivan', 'Cohen', 'Goldman'
];

const COMPANIES = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Salesforce', 'Oracle', 'IBM', 'Intel',
  'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'BlackRock', 'Citadel', 'Two Sigma', 'DE Shaw', 'Bridgewater',
  'McKinsey', 'BCG', 'Bain', 'Deloitte', 'PwC', 'KPMG', 'EY', 'Accenture',
  'Johnson & Johnson', 'Pfizer', 'UnitedHealth', 'CVS Health', 'Anthem', 'Cigna',
  'Skadden', 'Sullivan & Cromwell', 'Kirkland & Ellis', 'Latham & Watkins', 'Davis Polk',
  'CBRE', 'JLL', 'Cushman & Wakefield', 'Marcus & Millichap', 'Keller Williams',
  'Stripe', 'Square', 'Plaid', 'Robinhood', 'Coinbase', 'Airbnb', 'Uber', 'Lyft', 'DoorDash'
];

const JOB_TITLES: Record<Industry, string[]> = {
  TECHNOLOGY: ['Software Engineer', 'Product Manager', 'Engineering Manager', 'CTO', 'VP Engineering', 'Data Scientist', 'DevOps Engineer'],
  FINANCE: ['Investment Analyst', 'Portfolio Manager', 'Managing Director', 'CFO', 'VP Finance', 'Quantitative Analyst', 'Risk Manager'],
  HEALTHCARE: ['Physician', 'Chief Medical Officer', 'Healthcare Administrator', 'Clinical Director', 'VP Medical Affairs'],
  LEGAL: ['Partner', 'Associate', 'General Counsel', 'Corporate Attorney', 'Litigation Partner'],
  REAL_ESTATE: ['Broker', 'Managing Director', 'VP Development', 'Investment Manager', 'Property Manager'],
  CONSULTING: ['Partner', 'Principal', 'Managing Consultant', 'Strategy Director', 'Senior Consultant'],
  MARKETING: ['CMO', 'VP Marketing', 'Brand Director', 'Growth Lead', 'Marketing Manager'],
  SALES: ['VP Sales', 'Account Executive', 'Sales Director', 'Enterprise Sales', 'Business Development'],
  ENGINEERING: ['Principal Engineer', 'Chief Architect', 'Engineering Director', 'Technical Lead'],
  EXECUTIVE: ['CEO', 'President', 'COO', 'Managing Partner', 'Board Member'],
  ENTREPRENEURSHIP: ['Founder', 'Co-Founder', 'CEO', 'Managing Partner', 'Venture Partner'],
  OTHER: ['Consultant', 'Advisor', 'Independent Professional']
};

// Famous and well-known golf courses
const COURSES = [
  // California
  { name: 'Pebble Beach Golf Links', city: 'Pebble Beach', state: 'CA', lat: 36.5675, lng: -121.9486, type: CourseType.RESORT, par: 72, rating: 4.9, greenFee: 57500 },
  { name: 'Torrey Pines South Course', city: 'La Jolla', state: 'CA', lat: 32.8998, lng: -117.2527, type: CourseType.PUBLIC, par: 72, rating: 4.8, greenFee: 25200 },
  { name: 'Spyglass Hill Golf Course', city: 'Pebble Beach', state: 'CA', lat: 36.5782, lng: -121.9556, type: CourseType.RESORT, par: 72, rating: 4.7, greenFee: 41500 },
  { name: 'Pasatiempo Golf Club', city: 'Santa Cruz', state: 'CA', lat: 37.0012, lng: -122.0271, type: CourseType.SEMI_PRIVATE, par: 70, rating: 4.6, greenFee: 29500 },
  { name: 'Half Moon Bay Golf Links', city: 'Half Moon Bay', state: 'CA', lat: 37.4377, lng: -122.4415, type: CourseType.RESORT, par: 72, rating: 4.5, greenFee: 22500 },
  { name: 'TPC Harding Park', city: 'San Francisco', state: 'CA', lat: 37.7234, lng: -122.4931, type: CourseType.MUNICIPAL, par: 72, rating: 4.5, greenFee: 19500 },
  { name: 'The Olympic Club Lake Course', city: 'San Francisco', state: 'CA', lat: 37.7086, lng: -122.4942, type: CourseType.PRIVATE, par: 71, rating: 4.9, greenFee: 0 },

  // New York Area
  { name: 'Bethpage Black', city: 'Farmingdale', state: 'NY', lat: 40.7473, lng: -73.4566, type: CourseType.PUBLIC, par: 71, rating: 4.8, greenFee: 15000 },
  { name: 'Shinnecock Hills Golf Club', city: 'Southampton', state: 'NY', lat: 40.8917, lng: -72.4465, type: CourseType.PRIVATE, par: 70, rating: 5.0, greenFee: 0 },
  { name: 'Winged Foot Golf Club West', city: 'Mamaroneck', state: 'NY', lat: 40.9618, lng: -73.7381, type: CourseType.PRIVATE, par: 72, rating: 4.9, greenFee: 0 },

  // Florida
  { name: 'TPC Sawgrass Stadium Course', city: 'Ponte Vedra Beach', state: 'FL', lat: 30.1984, lng: -81.3958, type: CourseType.RESORT, par: 72, rating: 4.8, greenFee: 57500 },
  { name: 'Doral Blue Monster', city: 'Miami', state: 'FL', lat: 25.8198, lng: -80.3388, type: CourseType.RESORT, par: 72, rating: 4.6, greenFee: 35000 },
  { name: 'Bay Hill Club & Lodge', city: 'Orlando', state: 'FL', lat: 28.4607, lng: -81.5073, type: CourseType.RESORT, par: 72, rating: 4.7, greenFee: 32500 },
  { name: 'Streamsong Red', city: 'Streamsong', state: 'FL', lat: 27.6559, lng: -81.5181, type: CourseType.RESORT, par: 72, rating: 4.8, greenFee: 27500 },

  // Texas
  { name: 'Colonial Country Club', city: 'Fort Worth', state: 'TX', lat: 32.7243, lng: -97.3635, type: CourseType.PRIVATE, par: 70, rating: 4.7, greenFee: 0 },
  { name: 'Austin Country Club', city: 'Austin', state: 'TX', lat: 30.3597, lng: -97.8061, type: CourseType.PRIVATE, par: 72, rating: 4.6, greenFee: 0 },
  { name: 'Whispering Pines Golf Club', city: 'Trinity', state: 'TX', lat: 31.0734, lng: -95.3697, type: CourseType.PUBLIC, par: 72, rating: 4.5, greenFee: 19500 },

  // Arizona
  { name: 'TPC Scottsdale Stadium Course', city: 'Scottsdale', state: 'AZ', lat: 33.6416, lng: -111.9257, type: CourseType.PUBLIC, par: 71, rating: 4.6, greenFee: 24500 },
  { name: 'Troon North Monument', city: 'Scottsdale', state: 'AZ', lat: 33.7389, lng: -111.8475, type: CourseType.PUBLIC, par: 72, rating: 4.7, greenFee: 29500 },
  { name: 'Grayhawk Raptor Course', city: 'Scottsdale', state: 'AZ', lat: 33.6951, lng: -111.8540, type: CourseType.PUBLIC, par: 72, rating: 4.5, greenFee: 22500 },

  // Georgia
  { name: 'Augusta National Golf Club', city: 'Augusta', state: 'GA', lat: 33.5032, lng: -82.0223, type: CourseType.PRIVATE, par: 72, rating: 5.0, greenFee: 0 },
  { name: 'East Lake Golf Club', city: 'Atlanta', state: 'GA', lat: 33.7492, lng: -84.3156, type: CourseType.PRIVATE, par: 70, rating: 4.8, greenFee: 0 },

  // North Carolina
  { name: 'Pinehurst No. 2', city: 'Pinehurst', state: 'NC', lat: 35.1956, lng: -79.4692, type: CourseType.RESORT, par: 72, rating: 4.9, greenFee: 52500 },
  { name: 'Quail Hollow Club', city: 'Charlotte', state: 'NC', lat: 35.1019, lng: -80.8504, type: CourseType.PRIVATE, par: 72, rating: 4.7, greenFee: 0 },

  // Other notable courses
  { name: 'Whistling Straits Straits Course', city: 'Haven', state: 'WI', lat: 43.8509, lng: -87.7278, type: CourseType.RESORT, par: 72, rating: 4.8, greenFee: 42500 },
  { name: 'Bandon Dunes', city: 'Bandon', state: 'OR', lat: 43.1857, lng: -124.3955, type: CourseType.RESORT, par: 72, rating: 4.9, greenFee: 39500 },
  { name: 'Pacific Dunes', city: 'Bandon', state: 'OR', lat: 43.1782, lng: -124.4023, type: CourseType.RESORT, par: 71, rating: 4.9, greenFee: 39500 },
  { name: 'Sand Valley Golf Resort', city: 'Nekoosa', state: 'WI', lat: 44.0978, lng: -89.9128, type: CourseType.RESORT, par: 72, rating: 4.7, greenFee: 27500 },
  { name: 'Erin Hills', city: 'Erin', state: 'WI', lat: 43.1847, lng: -88.3348, type: CourseType.PUBLIC, par: 72, rating: 4.7, greenFee: 27500 },
  { name: 'Chambers Bay', city: 'University Place', state: 'WA', lat: 47.2024, lng: -122.5728, type: CourseType.PUBLIC, par: 72, rating: 4.6, greenFee: 22500 },
  { name: 'Kiawah Island Ocean Course', city: 'Kiawah Island', state: 'SC', lat: 32.6088, lng: -80.0283, type: CourseType.RESORT, par: 72, rating: 4.8, greenFee: 45000 },
  { name: 'Harbour Town Golf Links', city: 'Hilton Head', state: 'SC', lat: 32.1343, lng: -80.8264, type: CourseType.RESORT, par: 71, rating: 4.6, greenFee: 37500 },

  // Additional popular public courses
  { name: 'Arcadia Bluffs', city: 'Arcadia', state: 'MI', lat: 44.5011, lng: -86.2316, type: CourseType.PUBLIC, par: 72, rating: 4.7, greenFee: 22500 },
  { name: 'Cabot Cliffs', city: 'Inverness', state: 'NS', lat: 46.2142, lng: -61.4723, type: CourseType.RESORT, par: 72, rating: 4.9, greenFee: 32500 },
  { name: 'The Coeur d\'Alene Resort', city: 'Coeur d\'Alene', state: 'ID', lat: 47.6878, lng: -116.7884, type: CourseType.RESORT, par: 71, rating: 4.5, greenFee: 25000 },
  { name: 'Desert Willow Firecliff', city: 'Palm Desert', state: 'CA', lat: 33.7384, lng: -116.3581, type: CourseType.PUBLIC, par: 72, rating: 4.4, greenFee: 15500 },
  { name: 'Kapalua Plantation Course', city: 'Lahaina', state: 'HI', lat: 21.0063, lng: -156.6471, type: CourseType.RESORT, par: 73, rating: 4.7, greenFee: 39500 },
  { name: 'Ko\'olau Golf Club', city: 'Kaneohe', state: 'HI', lat: 21.3938, lng: -157.7884, type: CourseType.PUBLIC, par: 72, rating: 4.3, greenFee: 15000 },
  { name: 'The Links at Spanish Bay', city: 'Pebble Beach', state: 'CA', lat: 36.6081, lng: -121.9472, type: CourseType.RESORT, par: 72, rating: 4.5, greenFee: 30000 },
  { name: 'Mauna Kea Golf Course', city: 'Waimea', state: 'HI', lat: 20.0044, lng: -155.8193, type: CourseType.RESORT, par: 72, rating: 4.5, greenFee: 29500 },

  // More regional courses
  { name: 'We-Ko-Pa Saguaro', city: 'Fort McDowell', state: 'AZ', lat: 33.6293, lng: -111.6751, type: CourseType.PUBLIC, par: 71, rating: 4.6, greenFee: 19500 },
  { name: 'Tobacco Road Golf Club', city: 'Sanford', state: 'NC', lat: 35.3801, lng: -79.1803, type: CourseType.PUBLIC, par: 71, rating: 4.6, greenFee: 12500 },
  { name: 'Rustic Canyon Golf Course', city: 'Moorpark', state: 'CA', lat: 34.2856, lng: -118.8756, type: CourseType.PUBLIC, par: 72, rating: 4.4, greenFee: 8500 },
  { name: 'Cape Kidnappers', city: 'Hawke\'s Bay', state: 'NZ', lat: -39.6417, lng: 177.0472, type: CourseType.RESORT, par: 71, rating: 4.9, greenFee: 55000 },
  { name: 'Barnbougle Dunes', city: 'Bridport', state: 'TAS', lat: -41.0156, lng: 147.0981, type: CourseType.RESORT, par: 71, rating: 4.8, greenFee: 35000 },
];

const COURSE_AMENITIES = [
  'Driving Range', 'Practice Green', 'Pro Shop', 'Restaurant', 'Bar', 'Locker Room',
  'Club Rental', 'Cart Rental', 'Caddie Service', 'Golf Lessons', 'Club Fitting',
  'Spa', 'Pool', 'Tennis', 'Accommodation', 'Conference Facilities'
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.teeTimeSlot.deleteMany();
  await prisma.teeTime.deleteMany();
  await prisma.favoriteCourse.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');

  // Create 60 users
  const users = [];
  const industries = Object.values(Industry);
  const skillLevels = Object.values(SkillLevel);

  // Major city coordinates for realistic locations
  const locations = [
    { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
    { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
    { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
    { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
    { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
    { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
    { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
    { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
    { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
    { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
    { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  ];

  for (let i = 0; i < 60; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const industry = randomElement(industries);
    const location = randomElement(locations);

    // Add some randomness to location (within ~20 miles)
    const latOffset = (Math.random() - 0.5) * 0.3;
    const lngOffset = (Math.random() - 0.5) * 0.3;

    const user = await prisma.user.create({
      data: {
        clerkId: `clerk_${uuid().slice(0, 24)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        firstName,
        lastName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        industry,
        company: randomElement(COMPANIES),
        jobTitle: randomElement(JOB_TITLES[industry]),
        bio: `${randomElement(JOB_TITLES[industry])} passionate about golf and networking.`,
        handicap: Math.round((Math.random() * 30) * 10) / 10,
        skillLevel: randomElement(skillLevels),
        latitude: location.lat + latOffset,
        longitude: location.lng + lngOffset,
        city: location.city,
        state: location.state,
        searchRadius: randomBetween(25, 100),
      },
    });

    users.push(user);
  }

  console.log(`Created ${users.length} users`);

  console.log('Creating courses...');

  // Create courses
  const courses = [];

  for (const courseData of COURSES) {
    const numAmenities = randomBetween(4, 10);
    const amenities = randomElements(COURSE_AMENITIES, numAmenities);

    const course = await prisma.course.create({
      data: {
        name: courseData.name,
        slug: slugify(courseData.name),
        address: `${randomBetween(100, 9999)} Golf Course Dr`,
        city: courseData.city,
        state: courseData.state,
        zipCode: `${randomBetween(10000, 99999)}`,
        latitude: courseData.lat,
        longitude: courseData.lng,
        phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
        website: `https://www.${slugify(courseData.name)}.com`,
        courseType: courseData.type,
        holes: 18,
        par: courseData.par,
        rating: courseData.rating,
        slope: randomBetween(110, 155),
        yardage: randomBetween(6200, 7500),
        greenFee: courseData.greenFee,
        amenities,
        imageUrl: `https://source.unsplash.com/800x600/?golf,course,${slugify(courseData.city)}`,
        description: `Experience world-class golf at ${courseData.name}, one of the premier courses in ${courseData.state}.`,
      },
    });

    courses.push(course);
  }

  console.log(`Created ${courses.length} courses`);

  console.log('Creating tee times...');

  // Create tee times for the next 30 days
  const teeTimes = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let day = 0; day < 30; day++) {
    const date = addDays(now, day);

    // Create 6-10 tee times per day
    const numTeeTimes = randomBetween(6, 10);

    for (let t = 0; t < numTeeTimes; t++) {
      const host = randomElement(users);

      // Find courses near the host's location
      const nearbyCourses = courses.filter((c) => {
        if (!host.latitude || !host.longitude) return true;
        const distance = Math.sqrt(
          Math.pow(c.latitude - host.latitude, 2) +
          Math.pow(c.longitude - host.longitude, 2)
        );
        return distance < 2; // Roughly 100 miles
      });

      if (nearbyCourses.length === 0) continue;

      const course = randomElement(nearbyCourses);

      // Random tee time between 6am and 4pm
      const hour = randomBetween(6, 16);
      const minute = randomElement([0, 15, 30, 45]);
      const dateTime = new Date(date);
      dateTime.setHours(hour, minute, 0, 0);

      // Random industry preferences (0-3 industries)
      const numIndustryPrefs = randomBetween(0, 3);
      const industryPreference = numIndustryPrefs > 0
        ? randomElements(industries, numIndustryPrefs)
        : [];

      // Random skill preferences (0-2 levels)
      const numSkillPrefs = randomBetween(0, 2);
      const skillPreference = numSkillPrefs > 0
        ? randomElements(skillLevels, numSkillPrefs)
        : [];

      const totalSlots = randomBetween(2, 4);

      // Determine status based on date
      let status: TeeTimeStatus = 'OPEN';
      if (day < 0) {
        status = 'COMPLETED';
      } else if (Math.random() < 0.1) {
        status = 'CANCELLED';
      }

      const teeTime = await prisma.teeTime.create({
        data: {
          hostId: host.id,
          courseId: course.id,
          dateTime,
          totalSlots,
          industryPreference,
          skillPreference,
          notes: Math.random() > 0.5
            ? randomElement([
                'Looking forward to a great round!',
                'Casual round, all skill levels welcome.',
                'Playing the back 9 twice.',
                'Meeting in the clubhouse 30 mins before tee time.',
                'Walking only - no carts.',
              ])
            : null,
          status,
        },
      });

      teeTimes.push(teeTime);

      // Create slots
      const slots = [];
      for (let s = 1; s <= totalSlots; s++) {
        const slotData: {
          teeTimeId: string;
          slotNumber: number;
          userId: string | null;
          joinedAt: Date | null;
        } = {
          teeTimeId: teeTime.id,
          slotNumber: s,
          userId: null,
          joinedAt: null,
        };

        // Host always takes slot 1
        if (s === 1) {
          slotData.userId = host.id;
          slotData.joinedAt = teeTime.createdAt;
        } else if (status !== 'CANCELLED' && Math.random() < 0.4) {
          // 40% chance other slots are filled
          const otherUsers = users.filter((u) =>
            u.id !== host.id && !slots.some((slot) => slot.userId === u.id)
          );
          if (otherUsers.length > 0) {
            const joiner = randomElement(otherUsers);
            slotData.userId = joiner.id;
            slotData.joinedAt = addHours(teeTime.createdAt, randomBetween(1, 48));
          }
        }

        const slot = await prisma.teeTimeSlot.create({ data: slotData });
        slots.push(slot);
      }

      // Update status if all slots are filled
      const filledSlots = slots.filter((s) => s.userId !== null).length;
      if (filledSlots === totalSlots && status === 'OPEN') {
        await prisma.teeTime.update({
          where: { id: teeTime.id },
          data: { status: 'FULL' },
        });
      }

      // Add some messages to tee times with multiple players
      if (filledSlots > 1 && Math.random() > 0.5) {
        const participants = slots.filter((s) => s.userId !== null);
        const numMessages = randomBetween(1, 5);

        for (let m = 0; m < numMessages; m++) {
          const sender = randomElement(participants);
          if (!sender.userId) continue;

          await prisma.message.create({
            data: {
              teeTimeId: teeTime.id,
              senderId: sender.userId,
              content: randomElement([
                'Looking forward to playing!',
                'What time should we meet?',
                'Anyone need a cart?',
                'Great weather forecast for tomorrow!',
                'See you all on the first tee.',
                'Should we grab lunch after?',
                'I\'ll bring extra balls.',
                'Can\'t wait!',
              ]),
              createdAt: addHours(sender.joinedAt ?? teeTime.createdAt, randomBetween(0, 24)),
            },
          });
        }
      }
    }
  }

  console.log(`Created ${teeTimes.length} tee times`);

  // Create some favorite courses
  console.log('Creating favorite courses...');

  let favoriteCount = 0;
  for (const user of users) {
    const numFavorites = randomBetween(0, 5);
    const favoriteCourses = randomElements(courses, numFavorites);

    for (const course of favoriteCourses) {
      await prisma.favoriteCourse.create({
        data: {
          userId: user.id,
          courseId: course.id,
        },
      });
      favoriteCount++;
    }
  }

  console.log(`Created ${favoriteCount} favorite courses`);

  // Create some notifications
  console.log('Creating notifications...');

  let notificationCount = 0;
  for (const user of users.slice(0, 20)) {
    const numNotifications = randomBetween(1, 5);

    for (let n = 0; n < numNotifications; n++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: randomElement(['TEE_TIME_JOINED', 'NEW_MESSAGE', 'MATCH_FOUND', 'TEE_TIME_REMINDER']),
          title: randomElement([
            'New player joined!',
            'You have a new message',
            'Match found!',
            'Tee time reminder',
          ]),
          body: randomElement([
            'Someone joined your tee time at Pebble Beach.',
            'You have a new message in your tee time group.',
            'We found a tee time that matches your preferences!',
            'Your tee time is tomorrow at 8:00 AM.',
          ]),
          isRead: Math.random() > 0.3,
          createdAt: addDays(now, -randomBetween(0, 7)),
        },
      });
      notificationCount++;
    }
  }

  console.log(`Created ${notificationCount} notifications`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
