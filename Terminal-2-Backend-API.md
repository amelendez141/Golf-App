# Terminal 2 — Backend API (Node.js + Express + Prisma)

Paste the prompt below into Claude Code in this terminal. **Start this terminal first** — the database must be running before other services connect.

---

You are a world-class backend engineer building the API server for "LinkUp Golf" — a platform where professionals find open slots on tee times with people in their same industry at any golf course worldwide.

## Tech Stack
- Node.js 20+ with TypeScript (strict mode)
- Express.js with express-async-errors
- Prisma ORM with PostgreSQL
- Redis for caching and rate limiting
- Clerk webhook integration for auth (JWT verification middleware)
- Zod for request validation
- Winston for structured logging
- Jest + Supertest for testing
- Docker Compose for local PostgreSQL + Redis

## Project Structure
```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                    # Seed with realistic sample data
│   └── migrations/
├── src/
│   ├── index.ts                   # Server entry point
│   ├── app.ts                     # Express app setup, middleware
│   ├── config/
│   │   ├── env.ts                 # Environment variable validation with Zod
│   │   ├── database.ts            # Prisma client singleton
│   │   └── redis.ts               # Redis client
│   ├── middleware/
│   │   ├── auth.ts                # JWT verification, user context
│   │   ├── validate.ts            # Zod schema validation middleware
│   │   ├── rateLimit.ts           # Redis-based rate limiting
│   │   ├── errorHandler.ts        # Global error handler
│   │   └── cors.ts
│   ├── routes/
│   │   ├── index.ts               # Route aggregator
│   │   ├── teeTime.routes.ts
│   │   ├── course.routes.ts
│   │   ├── user.routes.ts
│   │   ├── message.routes.ts
│   │   └── webhook.routes.ts      # Clerk webhooks
│   ├── controllers/
│   │   ├── teeTime.controller.ts
│   │   ├── course.controller.ts
│   │   ├── user.controller.ts
│   │   └── message.controller.ts
│   ├── services/
│   │   ├── teeTime.service.ts     # Core business logic
│   │   ├── course.service.ts
│   │   ├── user.service.ts
│   │   ├── matching.service.ts    # Industry matching algorithm
│   │   ├── notification.service.ts
│   │   └── geocoding.service.ts   # Location-based queries
│   ├── validators/
│   │   ├── teeTime.schema.ts      # Zod schemas for tee time endpoints
│   │   ├── course.schema.ts
│   │   └── user.schema.ts
│   ├── types/
│   │   └── index.ts               # Shared types, enums
│   └── utils/
│       ├── pagination.ts
│       ├── slug.ts
│       └── errors.ts              # Custom error classes
├── tests/
│   ├── integration/
│   │   ├── teeTime.test.ts
│   │   └── course.test.ts
│   └── unit/
│       └── matching.test.ts
├── docker-compose.yml             # PostgreSQL + Redis
├── Dockerfile
├── tsconfig.json
└── package.json
```

## Database Schema (Prisma)

Design and implement the following schema:

### User
- id (UUID, primary key)
- clerkId (string, unique — from auth provider)
- email (string, unique)
- firstName, lastName
- displayName
- avatarUrl
- industry (enum: FINANCE, PRIVATE_CAPITAL, TECH, HEALTHCARE, LEGAL, REAL_ESTATE, CONSULTING, ENERGY, MEDIA_ENTERTAINMENT, GOVERNMENT, EDUCATION, RETIRED, OTHER)
- subIndustry (string, optional — e.g., "Venture Capital" under PRIVATE_CAPITAL)
- company (string, optional)
- jobTitle (string, optional)
- city, state, country
- latitude, longitude (for proximity searches)
- handicap (float, optional, 0-54)
- skillLevel (enum: BEGINNER, INTERMEDIATE, ADVANCED, COMPETITIVE)
- bio (text, optional)
- isVerified (boolean — future feature)
- isPublic (boolean, default true)
- createdAt, updatedAt

### Course
- id (UUID)
- name (string)
- slug (string, unique)
- address, city, state, country
- latitude, longitude
- courseType (enum: PUBLIC, SEMI_PRIVATE, PRIVATE, RESORT)
- holes (int: 9 or 18)
- par (int, optional)
- rating (float, optional — course rating)
- slope (int, optional)
- website (string, optional)
- phone (string, optional)
- imageUrl (string, optional)
- description (text, optional)
- amenities (string array — "driving range", "pro shop", "restaurant", etc.)
- createdAt, updatedAt

Index on (latitude, longitude) for geospatial queries.
Add a full-text search index on name and city.

### TeeTime
- id (UUID)
- hostId (UUID, FK → User)
- courseId (UUID, FK → Course)
- dateTime (DateTime — the tee time)
- totalSlots (int, 2-4)
- filledSlots (int, computed or denormalized)
- industryPreference (enum or null — null means open to all)
- skillLevel (enum: ANY, BEGINNER_FRIENDLY, INTERMEDIATE, COMPETITIVE)
- pricePerPerson (float, optional — in USD)
- currency (string, default "USD")
- notes (text, optional)
- status (enum: OPEN, FULL, CANCELLED, COMPLETED)
- isPublic (boolean, default true)
- createdAt, updatedAt

### TeeTimeSlot
- id (UUID)
- teeTimeId (UUID, FK → TeeTime)
- userId (UUID, FK → User, nullable)
- slotNumber (int, 1-4)
- status (enum: OPEN, FILLED, CANCELLED)
- joinedAt (DateTime, nullable)

Unique constraint on (teeTimeId, slotNumber).

### Message
- id (UUID)
- teeTimeId (UUID, FK → TeeTime)
- senderId (UUID, FK → User)
- content (text)
- createdAt

### Notification
- id (UUID)
- userId (UUID, FK → User)
- type (enum: SLOT_JOINED, SLOT_LEFT, TEE_TIME_CANCELLED, TEE_TIME_REMINDER, NEW_MATCH)
- title (string)
- body (text)
- data (JSON — metadata)
- isRead (boolean, default false)
- createdAt

### FavoriteCourse
- userId + courseId (composite PK)
- createdAt

## API Endpoints

### Tee Times
- `GET /api/tee-times` — List tee times with extensive filtering
  - Query params: industry, dateFrom, dateTo, lat, lng, radiusKm, skillLevel, courseType, minOpenSlots, courseId, hostId, sortBy (date, distance, popularity), page, limit
  - Returns paginated results with host profile, course info, slot details
  - **Industry matching**: By default, prioritize tee times matching the requesting user's industry, but include others below. Implement a relevance scoring algorithm:
    - Exact industry match: +10 points
    - Sub-industry match: +5 bonus
    - Geographic proximity: +1 to +8 points based on distance
    - Skill level compatibility: +3 points
    - Recency: slight boost for newly posted
  - Cache hot queries in Redis (5 min TTL)

- `GET /api/tee-times/:id` — Single tee time with full details
- `POST /api/tee-times` — Create a tee time (auth required)
  - Auto-creates slots based on totalSlots
  - Host auto-fills slot 1
  - Publishes event to Redis pub/sub for real-time (Terminal 3 consumes)
  
- `PATCH /api/tee-times/:id` — Update tee time (host only)
- `DELETE /api/tee-times/:id` — Cancel tee time (host only, notifies joined players)

- `POST /api/tee-times/:id/join` — Join an open slot
  - Validates: user not already in this tee time, open slots exist, industry preference met (or open)
  - Atomic operation (use Prisma transaction to prevent race conditions)
  - Publishes join event to Redis pub/sub
  - If tee time is now full, update status to FULL

- `DELETE /api/tee-times/:id/leave` — Leave a slot
  - Can't leave if you're the host (must cancel instead)
  - Opens the slot back up, updates status if was FULL

### Courses
- `GET /api/courses` — Search courses
  - Query params: q (text search), lat, lng, radiusKm, courseType, page, limit
  - Full-text search on name + city
  - Geospatial filtering using Haversine formula or PostGIS
  
- `GET /api/courses/:slug` — Course detail with upcoming tee times
- `POST /api/courses` — Add a new course (any authenticated user, with moderation queue)
- `POST /api/courses/:id/favorite` — Toggle favorite

### Users
- `GET /api/users/me` — Current user profile
- `PATCH /api/users/me` — Update profile
- `GET /api/users/:id` — Public profile
- `GET /api/users/me/tee-times` — Your tee times (hosting + joined)
- `GET /api/users/me/notifications` — Your notifications
- `PATCH /api/users/me/notifications/:id/read` — Mark as read

### Messages
- `GET /api/tee-times/:id/messages` — Get messages for a tee time group
- `POST /api/tee-times/:id/messages` — Send a message (must be in the tee time)

### Webhooks
- `POST /api/webhooks/clerk` — Handle Clerk user creation/update events

## Seed Data

Create a comprehensive seed script with:
- 50+ realistic users across all industries, with real-sounding names, companies, and cities worldwide
- 100+ real golf courses worldwide (use real names and approximate coordinates):
  - USA: Pebble Beach, Augusta National, TPC Sawgrass, Bethpage Black, Torrey Pines, Bandon Dunes, Pinehurst No. 2, Whistling Straits, etc.
  - UK/Ireland: St Andrews, Royal Portrush, Royal County Down, Carnoustie, Turnberry, etc.
  - Rest of world: Royal Melbourne, Cape Kidnappers, Cabot Cliffs, Valderrama, etc.
  - Plus many "normal" courses: local municipals, mid-tier public courses
- 200+ tee times across next 30 days, various statuses, mix of industries
- Realistic slot fill patterns (some full, some with 1-3 open slots)
- Sample messages in some tee time groups

## Key Implementation Details

1. **Race condition prevention**: Use Prisma transactions with SELECT FOR UPDATE semantics when joining slots. Two users clicking "Join" at the same time must not both get the same slot.

2. **Geospatial queries**: Implement efficient location-based filtering. Use the Haversine formula in raw SQL or consider PostGIS extension. Create an index strategy that makes radius queries fast.

3. **Redis pub/sub**: When tee times are created, updated, or slots change, publish events to Redis channels. Terminal 3's WebSocket server subscribes to these.

4. **Pagination**: Cursor-based pagination for the feed (better performance than offset). Return nextCursor in responses.

5. **Error handling**: Consistent error response format: { error: { code: string, message: string, details?: any } }. Use custom error classes (NotFoundError, ConflictError, ForbiddenError, ValidationError).

6. **Rate limiting**: 100 requests/minute per user for read endpoints, 20/minute for write endpoints.

7. **Logging**: Structured JSON logging with request ID tracing. Log all mutations with before/after state.

8. **Input validation**: Every endpoint validated with Zod. Sanitize all text inputs. Validate coordinates are valid lat/lng ranges.

Start by setting up Docker Compose for PostgreSQL + Redis, initializing the Prisma schema, running migrations, then building out the API layer by layer starting with courses and tee times since those are the core resources. Seed the database with rich, realistic data.
