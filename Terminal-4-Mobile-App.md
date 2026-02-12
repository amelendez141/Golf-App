# Terminal 4 — Mobile App (React Native / Expo)

Paste the prompt below into Claude Code in this terminal. Can run in parallel with Terminal 1.

---

You are a world-class mobile engineer building the React Native mobile app for "LinkUp Golf" — a platform where professionals find open slots on tee times with people in their same industry at any golf course worldwide.

## Tech Stack
- React Native with Expo SDK 52+
- TypeScript strict mode
- Expo Router for file-based navigation
- React Native Reanimated for animations
- React Native Gesture Handler
- React Native Maps (Mapbox or Google Maps)
- TanStack Query for data fetching
- Zustand for client state
- expo-notifications for push notifications
- expo-location for geolocation
- expo-image for optimized image loading
- expo-haptics for tactile feedback
- React Native Bottom Sheet (@gorhom/bottom-sheet)
- date-fns

## Design Direction
Match the web app's LUXURY EDITORIAL aesthetic but adapted for native mobile patterns.

**Color palette** (same as web):
- Primary: Deep forest green (#1B3A2D)
- Secondary: Warm sand/cream (#F5F0E8)
- Accent: Burnished gold (#C4A265)
- Background: #FDFCFA
- Cards: White with subtle shadow

**Typography** (native equivalents):
- Headings: Use a serif system font or bundle Playfair Display
- Body: SF Pro (iOS) / Roboto (Android) for maximum native feel
- Data: Monospace system font for tee times

**Mobile-specific design:**
- Large touch targets (min 44pt)
- Bottom tab navigation (5 tabs: Feed, Explore, Post, Messages, Profile)
- Pull-to-refresh with custom animation
- Haptic feedback on key interactions (join, post, like)
- Smooth 60fps animations everywhere
- Native-feeling gestures (swipe to go back, swipe actions on cards)
- Bottom sheets instead of modals where possible

## Project Structure
```
mobile/
├── app/
│   ├── _layout.tsx                   # Root layout with providers + tab navigator
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── onboarding.tsx            # Industry selection, handicap, photo
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab bar configuration
│   │   ├── feed/
│   │   │   ├── index.tsx             # Main feed
│   │   │   └── [id].tsx              # Tee time detail
│   │   ├── explore/
│   │   │   ├── index.tsx             # Map explorer
│   │   │   └── course/[slug].tsx     # Course detail
│   │   ├── post/
│   │   │   └── index.tsx             # Create tee time flow
│   │   ├── messages/
│   │   │   ├── index.tsx             # Message list
│   │   │   └── [teeTimeId].tsx       # Group chat
│   │   └── profile/
│   │       ├── index.tsx             # My profile
│   │       ├── edit.tsx              # Edit profile
│   │       ├── settings.tsx          # App settings
│   │       └── user/[id].tsx         # Other user's profile
│   └── (modals)/
│       ├── filters.tsx               # Feed filter bottom sheet
│       └── course-search.tsx         # Course search modal
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── Toast.tsx
│   ├── feed/
│   │   ├── TeeTimeCard.tsx           # Main feed card component
│   │   ├── FeedHeader.tsx            # Industry filter pills
│   │   ├── SlotIndicator.tsx         # Visual slot display (filled/open)
│   │   └── IndustryBadge.tsx
│   ├── map/
│   │   ├── CourseMap.tsx
│   │   ├── CourseMarker.tsx
│   │   └── CourseBottomSheet.tsx
│   ├── tee-time/
│   │   ├── TeeTimeDetail.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── JoinButton.tsx
│   │   ├── SlotList.tsx
│   │   └── CreateTeeTimeForm.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── HandicapBadge.tsx
│   │   └── GolfHistory.tsx
│   └── shared/
│       ├── EmptyState.tsx
│       ├── PullToRefresh.tsx
│       └── TabBar.tsx                # Custom tab bar
├── hooks/
│   ├── useTeeTimeFeed.ts
│   ├── useCourseSearch.ts
│   ├── useLocation.ts
│   ├── useWebSocket.ts
│   ├── useAuth.ts
│   ├── useHaptics.ts
│   └── useNotifications.ts
├── lib/
│   ├── api.ts                        # API client
│   ├── websocket.ts                  # WebSocket connection manager
│   ├── types.ts                      # Shared types
│   ├── constants.ts
│   ├── storage.ts                    # AsyncStorage helpers
│   └── theme.ts                      # Design tokens
├── assets/
│   ├── fonts/
│   └── images/
├── app.json
├── eas.json
├── tsconfig.json
└── package.json
```

## Key Screens to Build

### 1. Onboarding Flow (first-time users)
After sign-up, guide the user through a beautiful 4-step onboarding:
1. **Welcome** — "Welcome to LinkUp Golf" with elegant animation
2. **Industry** — Large, tappable industry cards in a grid. Select yours. Haptic on select.
3. **Golf Profile** — Handicap slider (0-54), skill level selector, home course (optional)
4. **Location** — Request location permission with explanation: "We'll show you tee times near you"

Each step has a progress bar and smooth page transitions (shared element transitions if possible).

### 2. Feed Screen (tabs/feed)
The hero screen of the app.

- **Header**: "LinkUp Golf" logo + notification bell (with unread badge) + user avatar
- **Industry pills**: Horizontal scrollable chips showing industries. User's industry is pre-selected and highlighted in gold. Tap to toggle filters.
- **Feed**: Vertical scrolling list of TeeTimeCards

**TeeTimeCard design:**
- White card with subtle shadow and rounded corners (16px)
- Top row: Course name (serif font), location (city, state)
- Date/time row: Formatted date + time in monospace, colored based on proximity (green = today/tomorrow, default = later)
- Slot indicator: Row of 4 circles. Filled slots show user avatars, open slots show dashed circles with "+" icon. Animated fill on join.
- Host row: Small avatar + name + company + industry badge
- Skill level tag + price (if any)
- "View Details" or "Join" button at bottom
- Subtle left border color coded by industry

**Pull to refresh**: Custom refresh indicator with a golf ball animation (ball drops into a hole).

**Empty state**: Illustrated golfer silhouette on a green. "No tee times yet in [Industry]. Be the first to post one!" with gold CTA button.

### 3. Tee Time Detail Screen (feed/[id])
- Hero image of the course (full width, with parallax scroll effect)
- Course name, location, date/time prominently displayed
- **Player section**: Each slot is a card:
  - Filled: Avatar, name, industry, company, handicap. Tap to view profile.
  - Open: Dashed card with "Join This Slot" button (gold, full width). Haptic on tap.
- Notes from host
- Map showing course location (small, tappable to expand)
- Group chat section at bottom (messages from the group)
- If host: floating action button with edit/cancel options

### 4. Explore Screen (tabs/explore)
- Full-screen map with course markers
- Search bar floating at top with "Search courses..." placeholder
- Custom markers: Green circle for courses with open tee times, gray for others. Number badge showing available times count.
- Tap marker → bottom sheet slides up with course card (image, name, ratings, X open tee times, "View Course" button)
- "Near Me" floating button (bottom right) — centers map on user's location with animation
- List view toggle (top right) — switches to scrollable list

### 5. Post Tee Time Screen (tabs/post)
Multi-step form with smooth step transitions:
1. **Course**: Search bar with autocomplete. Results show course name + city. Recent/favorite courses shown as quick picks.
2. **Date & Time**: Native date/time picker. Show day of week prominently.
3. **Details**: Total slots (2/3/4 segmented control), skill level, industry preference (or "Open to All"), price per person (optional), notes textarea.
4. **Review**: Summary card showing everything. "Post Tee Time" gold button with haptic confirmation.

Success state: Confetti animation + "Your tee time is live! We'll notify golfers in your industry nearby."

### 6. Messages Screen (tabs/messages)
- List of tee time group chats you're part of
- Each row: Course name, date, last message preview, unread indicator
- Tap → group chat screen with messages, input bar, send button
- Messages have sender avatar, name, timestamp
- Auto-scroll to bottom on new messages (via WebSocket)

### 7. Profile Screen (tabs/profile)
- Profile header: Large avatar (tappable to change), name, industry badge, company
- Stats row: Handicap | Rounds Played | Member Since
- "My Tee Times" section: Upcoming (with countdown) + Past
- Favorite Courses grid
- Settings gear icon → Settings screen

### 8. Custom Tab Bar
- 5 tabs: Feed (list icon), Explore (map icon), Post (+ icon in gold circle, raised), Messages (chat icon with badge), Profile (person icon)
- Active tab: gold icon + label. Inactive: muted gray.
- The center "Post" tab should be elevated/prominent (FAB-style)
- Haptic feedback on tab switch
- Smooth icon transitions

## Mobile-Specific Features

1. **Push notifications**: Register for push tokens on onboarding. Handle notification taps to deep-link to the relevant tee time.

2. **WebSocket**: Maintain persistent connection when app is in foreground. Reconnect with exponential backoff. Show connection status indicator if disconnected.

3. **Offline support**: Cache the last-loaded feed in AsyncStorage. Show cached data with "Last updated X minutes ago" banner when offline.

4. **Location**: Use expo-location for "near me" features. Request permission gracefully with explanation. Fall back to manual city selection.

5. **Haptics**: Light haptic on button press, medium on join/post actions, success haptic on confirmations.

6. **Deep linking**: Support linkup://tee-time/{id} and https://linkupgolf.com/tee-time/{id} deep links.

7. **Image handling**: Use expo-image with blurhash placeholders for course photos. Cache aggressively.

8. **Keyboard handling**: Auto-dismiss on scroll. KeyboardAvoidingView on all forms. Smooth keyboard animations.

## Animation Guidelines
- Page transitions: Shared element transitions where possible (course photo from card to detail)
- Card press: Scale down to 0.98 with spring animation
- Join button: Scale up + color pulse on success
- Slot fill: Avatar slides in from right with spring physics
- Tab switch: Cross-fade with slight slide
- Bottom sheet: Spring-based physics (overdamped)
- Pull to refresh: Custom golf ball animation
- Empty states: Subtle floating/parallax animation

## API Integration
Same endpoints as the web app (Terminal 2):
- Base URL configured via environment variable
- Auth token sent in Authorization header
- Handle 401s by redirecting to sign-in
- Retry failed requests (3 attempts with backoff)
- Cancel in-flight requests on screen change

## Quality Bar
- 60fps animations at all times
- < 2 second cold start
- < 500ms screen transitions
- Works on iOS 16+ and Android 13+
- Handles edge cases: no internet, empty data, long text, RTL
- No layout jumps or flash of unstyled content
- Accessibility: VoiceOver/TalkBack support, dynamic type sizes

Start by initializing the Expo project, setting up the navigation structure with expo-router, building the theme/design system, then the component library. Build the feed screen first as it's the core experience, then expand to other screens.
