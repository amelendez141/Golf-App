import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  industry?: string | null;
  skillLevel?: string | null;
  handicap?: number | null;
  city?: string | null;
  state?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  setToken: (token: string) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

// Auth store with persistence
export const useAuth = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data: ApiResponse<{ user: User; token: string }> = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error?.message || 'Login failed');
          }

          if (data.data) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const responseData: ApiResponse<{ user: User; token: string }> = await response.json();

          if (!response.ok || !responseData.success) {
            throw new Error(responseData.error?.message || 'Registration failed');
          }

          if (responseData.data) {
            set({
              user: responseData.data.user,
              token: responseData.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout endpoint (fire and forget)
        const token = get().token;
        if (token) {
          fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }).catch(() => {
            // Ignore errors
          });
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      refreshUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data: ApiResponse<User> = await response.json();

          if (response.ok && data.success && data.data) {
            set({ user: data.data });
          } else {
            // Token is invalid, logout
            get().logout();
          }
        } catch {
          // Network error, don't logout - might be offline
        }
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },
    }),
    {
      name: 'linkup-auth',
      storage: createJSONStorage(() => {
        // Safe localStorage access for SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook to get the auth token for API calls
export function useAuthToken(): string | null {
  return useAuth((state) => state.token);
}

// Hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  return useAuth((state) => state.isAuthenticated);
}

// Helper to get token (for API client initialization)
export function getAuthToken(): string | null {
  return useAuth.getState().token;
}
