# Terminal 1 — Frontend (Next.js Web App)

Paste the prompt below into Claude Code in this terminal.

---

You are a world-class frontend engineer and UI designer building "LinkUp Golf" — a premium golf tee time discovery platform where professionals find open slots on tee times with people in their same industry (finance, private capital, tech, healthcare, retired, etc.) at any golf course worldwide.

## Tech Stack
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS 4 with custom design tokens
- Framer Motion for animations
- Mapbox GL JS for course maps
- Clerk for authentication
- TanStack Query for data fetching
- Zustand for client state
- date-fns for date handling

## Design Direction
LUXURY EDITORIAL meets MODERN SPORT. Think: the refined aesthetic of a private golf club membership book crossed with a Bloomberg terminal's information density. 

**Color palette:**
- Primary: Deep forest green (#1B3A2D) 
- Secondary: Warm sand/cream (#F5F0E8)
- Accent: Burnished gold (#C4A265)
- Text: Near-black (#1A1A1A)
- Cards: White with subtle warm undertone (#FDFCFA)
- Status colors: Emerald green (open), amber (filling), muted red (full)

**Typography:**
- Display/Headings: "Playfair Display" (serif, editorial elegance)
- Body/UI: "DM Sans" (clean, modern, highly legible)
- Data/Numbers: "JetBrains Mono" (monospace for tee times, scores)

**Design principles:**
- Generous whitespace, asymmetric layouts
- Subtle grain texture overlays on hero sections
- Micro-interactions on every interactive element (hover lifts, smooth transitions)
- Card-based UI with soft shadows that feel tactile
- Map interactions feel like a luxury travel app
- Mobile-first responsive design

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts, providers, nav
│   │   ├── page.tsx                # Landing/marketing page (if logged out) or dashboard (if logged in)
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Dashboard shell with sidebar nav
│   │   │   ├── feed/page.tsx       # Main feed — open tee times in your industry
│   │   │   ├── explore/page.tsx    # Map-based course explorer
│   │   │   ├── my-times/page.tsx   # Your posted tee times & joined times
│   │   │   ├── messages/page.tsx   # Direct messages with golfers
│   │   │   ├── profile/page.tsx    # Your profile & handicap
│   │   │   └── settings/page.tsx   # Preferences, industry, notifications
│   │   ├── course/[slug]/page.tsx  # Individual course page with available times
│   │   └── tee-time/[id]/page.tsx  # Individual tee time detail & join flow
│   ├── components/
│   │   ├── ui/                     # Base UI primitives (Button, Card, Badge, Input, Modal, etc.)
│   │   ├── layout/                 # Navbar, Sidebar, Footer, MobileNav
│   │   ├── feed/                   # TeeTimeCard, FeedFilters, IndustryBadge
│   │   ├── map/                    # CourseMap, MapMarker, MapPopup
│   │   ├── profile/                # ProfileCard, HandicapDisplay, IndustrySelector
│   │   ├── tee-time/               # TeeTimeDetail, SlotIndicator, JoinButton, PlayerList
│   │   └── shared/                 # Avatar, LoadingSkeleton, EmptyState, Toast
│   ├── hooks/
│   │   ├── useTeeTimeFeed.ts
│   │   ├── useCourseSearch.ts
│   │   ├── useProfile.ts
│   │   └── useWebSocket.ts
│   ├── lib/
│   │   ├── api.ts                  # API client with interceptors
│   │   ├── types.ts                # Shared TypeScript types
│   │   ├── constants.ts            # Industry list, golf constants
│   │   └── utils.ts
│   └── styles/
│       └── globals.css             # Tailwind config, custom properties, grain texture
├── public/
│   ├── fonts/
│   └── images/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Pages to Build

### 1. Landing Page (/)
- Hero section with grain texture overlay, large serif headline: "Find Your Foursome."
- Subheadline: "Connect with professionals in your industry for tee times at courses worldwide."
- Animated golf course illustration or high-quality hero image area
- Three value props with icons: "Industry Matching", "Any Course Worldwide", "Real-Time Availability"
- Social proof section with user count and testimonials
- CTA buttons with gold accent hover states

### 2. Feed Page (/feed) — THE CORE PAGE
This is the most important page. It shows a scrollable feed of open tee times filtered to the user's industry.

Each TeeTimeCard shows:
- Course name & location (city, state/country)
- Date & time (formatted beautifully)
- Slots: visual indicator (e.g., "2 of 4 filled" with avatar stack + empty slot dots)
- Industry badge (e.g., "Finance", "Tech")
- Host profile mini-card (name, company, handicap)
- Skill level indicator (beginner-friendly, intermediate, competitive)
- Price per person if applicable
- "Join" CTA button (gold, with hover animation)
- Quick-view expansion for more details

Filters sidebar/top bar:
- Industry (multi-select)
- Date range picker
- Location / radius from a point
- Skill level
- Course type (public, semi-private, private)
- Available slots (1+, 2+, 3+)
- Sort: Nearest date, Closest to me, Most popular

### 3. Explore Page (/explore)
- Full-screen Mapbox map showing courses with available tee times
- Custom map markers: green pins for courses with open slots, gray for none
- Click marker → popup card with course info + number of available times
- Side panel (desktop) or bottom sheet (mobile) with list view
- Search bar overlay for course/city search
- "Near Me" button using geolocation

### 4. Tee Time Detail (/tee-time/[id])
- Full detail view of a single tee time
- Course info with photo carousel
- Map embed showing course location
- Player list with profile cards (photo, name, industry, handicap, company)
- Empty slots shown as dashed-border placeholder cards with "Join This Slot" CTA
- Chat/comments section for the group
- Host controls if you're the creator (edit time, remove players, cancel)

### 5. Post a Tee Time Flow
- Multi-step modal or page:
  1. Search & select course (autocomplete with worldwide course database)
  2. Pick date & time
  3. Set total slots (2-4), skill level, industry preference (or open to all)
  4. Add notes (e.g., "Walking round, 18 holes, drinks after")
  5. Preview & publish
- Beautiful step indicator with progress animation

### 6. Profile Page (/profile)
- Profile photo, name, industry, company (optional), city
- Handicap display (with trend chart if data available)
- Rounds played through the app
- "Golf Resume" — past tee times with ratings/reviews
- Favorite courses
- Edit profile modal

## Critical Implementation Details

1. **Real-time updates**: Use WebSocket connection (from Terminal 3) to update the feed live when new tee times are posted or slots fill up. Show a toast: "New tee time posted at Pebble Beach — 2 slots open"

2. **Optimistic UI**: When a user clicks "Join", immediately show them in the slot with a loading state, then confirm via API.

3. **Responsive design**: Every page must work flawlessly on mobile. The feed should feel native-app-quality on phones. Use bottom sheet patterns, swipe gestures where appropriate.

4. **Loading states**: Use skeleton loaders that match the card layouts exactly. Never show a blank page.

5. **Empty states**: Beautiful illustrated empty states. "No tee times in your area? Be the first to post one!" with a CTA.

6. **Search**: Debounced course search with worldwide autocomplete. Should feel instant.

7. **Accessibility**: Full keyboard navigation, ARIA labels, screen reader support, focus rings styled to match the gold accent.

## API Endpoints to Consume (from Terminal 2)
- GET /api/tee-times — feed with filters
- GET /api/tee-times/:id — single tee time
- POST /api/tee-times — create tee time
- POST /api/tee-times/:id/join — join a slot
- DELETE /api/tee-times/:id/leave — leave a slot
- GET /api/courses — search courses
- GET /api/courses/:slug — course detail
- GET /api/users/me — current user profile
- PATCH /api/users/me — update profile
- GET /api/users/:id — public profile
- WebSocket: ws://localhost:3001 — real-time events

## Quality Bar
- Lighthouse score: 95+ on all metrics
- No layout shift on page load
- Sub-200ms interaction responses
- Every animation at 60fps
- Zero TypeScript errors in strict mode
- Consistent spacing system (4px base grid)

Build this frontend to be genuinely beautiful — the kind of app that makes someone say "this feels like it was made by a top design agency." Every pixel matters. Every interaction should feel considered. The overall impression should be: premium, trustworthy, and exciting.

Start by initializing the project, installing all dependencies, setting up the Tailwind config with the design tokens, and building out the component library. Then build page by page starting with the layout and feed page since that's the core experience.
