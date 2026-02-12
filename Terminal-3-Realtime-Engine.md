# Terminal 3 — Real-Time Engine (WebSocket + Matching + Notifications)

Paste the prompt below into Claude Code in this terminal. **Start this after Terminal 2** — it connects to the same database and Redis instance.

---

You are a world-class systems engineer building the real-time engine for "LinkUp Golf" — a platform where professionals find open slots on tee times with people in their same industry at any golf course worldwide.

This service handles: WebSocket connections for live updates, the industry matching/recommendation engine, push notifications, and scheduled jobs.

## Tech Stack
- Node.js 20+ with TypeScript
- ws (WebSocket library) or Socket.io
- Redis (pub/sub for events from the API server + caching)
- Bull/BullMQ for job queues (notifications, matching, cleanup)
- Prisma client (shared database with Terminal 2)
- node-cron for scheduled tasks
- Web Push API for browser push notifications
- Nodemailer for email notifications (with templates)

## Project Structure
```
realtime/
├── src/
│   ├── index.ts                      # Entry point — starts WS server + workers
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts               # Prisma client
│   │   └── redis.ts                  # Redis clients (pub/sub + cache + queue)
│   ├── websocket/
│   │   ├── server.ts                 # WebSocket server setup
│   │   ├── auth.ts                   # JWT verification for WS connections
│   │   ├── connectionManager.ts      # Track active connections by userId
│   │   ├── handlers/
│   │   │   ├── subscribe.ts          # Subscribe to feed, tee time rooms
│   │   │   ├── unsubscribe.ts
│   │   │   └── ping.ts               # Keep-alive
│   │   └── broadcaster.ts            # Broadcast events to relevant clients
│   ├── events/
│   │   ├── subscriber.ts             # Redis pub/sub subscriber
│   │   ├── eventTypes.ts             # Event type definitions
│   │   └── handlers/
│   │       ├── teeTimeCreated.ts     # New tee time → notify matching users
│   │       ├── slotJoined.ts         # Slot filled → notify tee time group
│   │       ├── slotLeft.ts           # Slot opened → notify waitlist / matching
│   │       ├── teeTimeCancelled.ts   # Cancelled → notify all participants
│   │       ├── messageSent.ts        # New message → notify tee time group
│   │       └── teeTimeUpdated.ts
│   ├── matching/
│   │   ├── engine.ts                 # Core matching algorithm
│   │   ├── scorer.ts                 # Multi-factor relevance scoring
│   │   ├── recommender.ts            # "Tee times you might like" engine
│   │   └── types.ts
│   ├── notifications/
│   │   ├── push.ts                   # Web Push notification sender
│   │   ├── email.ts                  # Email notification sender
│   │   ├── inApp.ts                  # In-app notification creator (writes to DB)
│   │   └── templates/
│   │       ├── newMatch.ts           # "A new tee time in Finance was just posted!"
│   │       ├── slotFilled.ts         # "John from Goldman joined your tee time"
│   │       ├── reminder.ts           # "Your tee time at Pebble Beach is tomorrow"
│   │       └── welcome.ts
│   ├── jobs/
│   │   ├── queue.ts                  # BullMQ queue setup
│   │   ├── workers/
│   │   │   ├── notificationWorker.ts # Process notification jobs
│   │   │   ├── matchingWorker.ts     # Run matching for new tee times
│   │   │   ├── reminderWorker.ts     # Scheduled reminders
│   │   │   └── cleanupWorker.ts      # Archive past tee times, clean stale data
│   │   └── schedulers/
│   │       ├── reminderScheduler.ts  # Schedule reminders 24h and 2h before tee times
│   │       └── digestScheduler.ts    # Daily/weekly digest emails
│   └── utils/
│       ├── logger.ts
│       └── metrics.ts                # Connection count, message throughput
├── prisma/                           # Symlink or copy of backend's schema
├── tsconfig.json
└── package.json
```

## WebSocket Protocol

### Connection
- Client connects to ws://localhost:3001 with JWT in query string or auth header
- Server verifies JWT, extracts userId, registers connection
- Server sends: `{ type: "connected", userId: "...", timestamp: "..." }`

### Client → Server Messages
```typescript
// Subscribe to the main feed (filtered by user's industry)
{ type: "subscribe:feed", data: { industries?: string[], location?: { lat, lng, radiusKm } } }

// Subscribe to a specific tee time room (for live chat + updates)
{ type: "subscribe:tee-time", data: { teeTimeId: string } }

// Unsubscribe
{ type: "unsubscribe:feed" }
{ type: "unsubscribe:tee-time", data: { teeTimeId: string } }

// Ping (keep-alive)
{ type: "ping" }
```

### Server → Client Messages
```typescript
// New tee time in your feed
{ type: "feed:new-tee-time", data: { teeTime: TeeTimeWithDetails } }

// Tee time updated (slot filled, details changed)
{ type: "feed:tee-time-updated", data: { teeTimeId: string, changes: Partial<TeeTime> } }

// Slot joined in a tee time you're subscribed to
{ type: "tee-time:slot-joined", data: { teeTimeId: string, slot: SlotWithUser } }

// Slot opened
{ type: "tee-time:slot-left", data: { teeTimeId: string, slotNumber: number } }

// New message in tee time group
{ type: "tee-time:message", data: { teeTimeId: string, message: MessageWithSender } }

// Tee time cancelled
{ type: "tee-time:cancelled", data: { teeTimeId: string, reason?: string } }

// Notification
{ type: "notification", data: { notification: Notification } }

// Pong
{ type: "pong" }
```

## Matching Engine

The matching engine is the brain of LinkUp Golf. It determines which tee times to show each user and in what order.

### Scoring Algorithm (implement in scorer.ts)

For each (user, teeTime) pair, compute a relevance score (0-100):

```
INDUSTRY_MATCH (0-30 points):
  - Exact industry match: 30
  - Related industry (define a relatedness map, e.g., Finance ↔ Private Capital = 20): 15-25
  - No match but tee time is open to all: 10
  - Industry mismatch with industry-specific tee time: 0

PROXIMITY (0-25 points):
  - Same city: 25
  - Within 25km: 20
  - Within 50km: 15
  - Within 100km: 10
  - Within 250km: 5
  - Beyond 250km: 2 (people travel for golf)

SKILL_COMPATIBILITY (0-15 points):
  - Exact skill level match: 15
  - Adjacent level (beginner ↔ intermediate): 10
  - Tee time is "ANY" skill: 12
  - Two levels apart: 3

TIME_RELEVANCE (0-15 points):
  - Within 48 hours: 15
  - Within 7 days: 12
  - Within 14 days: 8
  - Within 30 days: 4

AVAILABILITY (0-10 points):
  - 3 open slots: 10
  - 2 open slots: 7
  - 1 open slot: 4

SOCIAL (0-5 points):
  - Host has mutual connections: 5
  - Host has high rating: 3
  - New host (encourage discovery): 2
```

Total score determines feed ordering. Cache computed scores in Redis (invalidate on tee time changes).

### Industry Relatedness Map
Define relationships between industries for "soft matching":
```
FINANCE ↔ PRIVATE_CAPITAL (high)
FINANCE ↔ CONSULTING (medium)
TECH ↔ CONSULTING (medium)
PRIVATE_CAPITAL ↔ REAL_ESTATE (medium)
LEGAL ↔ FINANCE (medium)
LEGAL ↔ REAL_ESTATE (medium)
HEALTHCARE ↔ EDUCATION (low)
MEDIA_ENTERTAINMENT ↔ TECH (low)
```

### Recommender (recommender.ts)
- When a user opens the app, pre-compute their top 50 tee time matches
- Cache in Redis for 5 minutes
- On tee time creation/update, invalidate relevant caches
- Also generate "Users who might want to join" suggestions for hosts

## Notification System

### Event Flow
1. API server (Terminal 2) publishes event to Redis channel `linkup:events`
2. This service's subscriber picks it up
3. Event handler determines who needs to be notified and how
4. Creates jobs in BullMQ queues:
   - `notifications:push` — Web Push notifications
   - `notifications:email` — Email notifications
   - `notifications:in-app` — Database writes for in-app notification center

### Notification Rules
- **New tee time posted**: Notify users in the same industry within 100km (push + in-app). Batch if multiple in short window.
- **Slot joined**: Notify host + all current participants (push + in-app)
- **Slot left**: Notify host + participants (in-app only)
- **Tee time cancelled**: Notify all participants (push + email + in-app)
- **24h reminder**: Notify all participants (push + email)
- **2h reminder**: Notify all participants (push only)
- **Weekly digest**: Email users with top 5 matching tee times for the upcoming week

### Push Notification Templates
Keep them concise and enticing:
- "🏌️ New tee time in Finance! Pebble Beach, Sat 8:00 AM — 2 slots open"
- "John D. from Blackstone joined your tee time at TPC Sawgrass"
- "Reminder: Tee time tomorrow at 7:30 AM at Bethpage Black"

## Scheduled Jobs

### Reminder Scheduler (runs every hour)
- Query tee times happening in 24h ± 30min
- Create reminder notification jobs for each participant
- Same for 2h reminders

### Cleanup Worker (runs daily at 3 AM)
- Mark tee times > 6 hours past as COMPLETED
- Archive tee times older than 90 days
- Clean up orphaned notifications older than 30 days

### Digest Scheduler (runs Sunday at 6 PM user's local time)
- For each active user, compute their top 5 matching tee times for the next 7 days
- Queue digest email

## Connection Management

### ConnectionManager
- Map<userId, Set<WebSocket>> (users can have multiple tabs/devices)
- On disconnect, clean up subscriptions
- Track: total connections, connections per user, subscriptions per channel
- Heartbeat: send ping every 30s, disconnect if no pong in 90s
- Graceful shutdown: close all connections with a 1001 code

### Room Management
- Feed rooms: grouped by industry (e.g., "feed:FINANCE", "feed:TECH")
- Tee time rooms: "tee-time:{id}"
- Users can be in multiple rooms simultaneously

## Key Implementation Details

1. **Scalability**: Design for horizontal scaling. Use Redis pub/sub so multiple WS server instances can communicate. Connection state in Redis, not just memory.

2. **Backpressure**: If a client can't keep up with messages, buffer up to 100 messages then start dropping oldest. Track slow clients.

3. **Reconnection**: Client should implement exponential backoff reconnection. Server should handle rapid reconnects gracefully (debounce state sync).

4. **Error handling**: Never crash the WS server on a single connection error. Wrap all handlers in try/catch. Log errors with connection context.

5. **Metrics**: Track and log: active connections, messages/second, average latency, queue depths, matching computation time.

Start by setting up the WebSocket server with auth and connection management, then implement the Redis pub/sub event system, then the matching engine, then the notification pipeline. Test with mock events before connecting to Terminal 2's API.
