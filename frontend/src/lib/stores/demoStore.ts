import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Demo store for managing demo-specific state
interface DemoState {
  // Tour state
  hasSeenTour: boolean;
  isTourOpen: boolean;
  tourStep: number;
  setHasSeenTour: (seen: boolean) => void;
  setTourOpen: (open: boolean) => void;
  setTourStep: (step: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;

  // Showcase mode
  isShowcaseMode: boolean;
  showcaseStep: number;
  setShowcaseMode: (active: boolean) => void;
  setShowcaseStep: (step: number) => void;
  nextShowcaseStep: () => void;

  // Activity feed
  isActivityFeedVisible: boolean;
  setActivityFeedVisible: (visible: boolean) => void;

  // Stats
  animatedStats: {
    users: number;
    teeTimes: number;
    courses: number;
    connections: number;
  };
  setAnimatedStats: (stats: Partial<DemoState['animatedStats']>) => void;

  // Reset demo
  resetDemo: () => void;
}

const TOTAL_TOUR_STEPS = 4;
const TOTAL_SHOWCASE_STEPS = 6;

const initialState = {
  hasSeenTour: false,
  isTourOpen: false,
  tourStep: 0,
  isShowcaseMode: false,
  showcaseStep: 0,
  isActivityFeedVisible: true,
  animatedStats: {
    users: 0,
    teeTimes: 0,
    courses: 0,
    connections: 0,
  },
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasSeenTour: (hasSeenTour) => set({ hasSeenTour }),
      setTourOpen: (isTourOpen) => set({ isTourOpen }),
      setTourStep: (tourStep) => set({ tourStep }),

      nextTourStep: () => {
        const { tourStep } = get();
        if (tourStep < TOTAL_TOUR_STEPS - 1) {
          set({ tourStep: tourStep + 1 });
        } else {
          set({ isTourOpen: false, hasSeenTour: true });
        }
      },

      prevTourStep: () => {
        const { tourStep } = get();
        if (tourStep > 0) {
          set({ tourStep: tourStep - 1 });
        }
      },

      setShowcaseMode: (isShowcaseMode) => set({ isShowcaseMode, showcaseStep: 0 }),
      setShowcaseStep: (showcaseStep) => set({ showcaseStep }),

      nextShowcaseStep: () => {
        const { showcaseStep } = get();
        if (showcaseStep < TOTAL_SHOWCASE_STEPS - 1) {
          set({ showcaseStep: showcaseStep + 1 });
        } else {
          set({ isShowcaseMode: false, showcaseStep: 0 });
        }
      },

      setActivityFeedVisible: (isActivityFeedVisible) => set({ isActivityFeedVisible }),

      setAnimatedStats: (stats) =>
        set((state) => ({
          animatedStats: { ...state.animatedStats, ...stats },
        })),

      resetDemo: () => {
        // Clear all demo-related localStorage items
        if (typeof window !== 'undefined') {
          localStorage.removeItem('linkup-welcome-seen');
          localStorage.removeItem('demo-store');
          localStorage.removeItem('user-store');
        }
        set(initialState);
        // Reload the page for a fresh start
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      },
    }),
    {
      name: 'demo-store',
      partialize: (state) => ({
        hasSeenTour: state.hasSeenTour,
        isActivityFeedVisible: state.isActivityFeedVisible,
      }),
    }
  )
);

export const TOUR_STEPS = [
  {
    id: 'browse',
    title: 'Browse Tee Times',
    description: 'Discover available tee times at premium courses near you. Filter by date, location, and skill level.',
    target: '[data-tour="browse"]',
    position: 'bottom' as const,
    icon: 'calendar',
  },
  {
    id: 'recommendations',
    title: 'Smart Recommendations',
    description: 'Our AI matches you with compatible golfers based on industry, skill level, and location.',
    target: '[data-tour="recommendations"]',
    position: 'bottom' as const,
    icon: 'sparkles',
  },
  {
    id: 'join',
    title: 'Join a Group',
    description: 'Found a great match? Join with one click. The host will be notified instantly.',
    target: '[data-tour="join"]',
    position: 'left' as const,
    icon: 'users',
  },
  {
    id: 'messages',
    title: 'Connect & Message',
    description: 'Coordinate with your foursome through real-time chat. Build your professional network.',
    target: '[data-tour="messages"]',
    position: 'right' as const,
    icon: 'chat',
  },
];

export const SHOWCASE_STEPS = [
  { page: '/', duration: 3000, description: 'Home dashboard' },
  { page: '/explore', duration: 4000, description: 'Course exploration' },
  { page: '/my-times', duration: 3000, description: 'Personal tee times' },
  { page: '/messages', duration: 3000, description: 'Messaging' },
  { page: '/settings', duration: 2000, description: 'User settings' },
  { page: '/', duration: 2000, description: 'Return home' },
];
