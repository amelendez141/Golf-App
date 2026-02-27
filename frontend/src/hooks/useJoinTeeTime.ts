'use client';

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { TeeTime, ApiResponse, User } from '@/lib/types';

interface JoinParams {
  teeTimeId: string;
  slotNumber?: number;
}

interface FeedPage {
  data: TeeTime[];
  pagination?: { nextCursor?: string; hasMore?: boolean };
}

export function useJoinTeeTime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ teeTimeId, slotNumber }: JoinParams) => {
      const response = await api.joinTeeTime(teeTimeId, slotNumber);
      return response.data;
    },

    // Optimistic update - instantly show the user joined
    onMutate: async ({ teeTimeId, slotNumber }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['teeTimeFeed'] });
      await queryClient.cancelQueries({ queryKey: ['teeTime', teeTimeId] });

      // Snapshot previous values for rollback
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedPage>>(['teeTimeFeed']);
      const previousTeeTime = queryClient.getQueryData<TeeTime>(['teeTime', teeTimeId]);

      // Create optimistic user slot data
      const optimisticUser: Partial<User> = user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      } : undefined;

      // Optimistically update feed
      if (previousFeed && user) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(['teeTimeFeed'], (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((tt) => {
                if (tt.id !== teeTimeId) return tt;

                // Find the slot to fill
                const targetSlot = slotNumber
                  ? tt.slots?.find((s) => s.slotNumber === slotNumber && !s.user)
                  : tt.slots?.find((s) => !s.user);

                if (!targetSlot) return tt;

                return {
                  ...tt,
                  availableSlots: Math.max(0, tt.availableSlots - 1),
                  slots: tt.slots?.map((slot) =>
                    slot.slotNumber === targetSlot.slotNumber
                      ? { ...slot, user: optimisticUser as User, userId: user.id }
                      : slot
                  ),
                };
              }),
            })),
          };
        });
      }

      // Optimistically update single tee time if cached
      if (previousTeeTime && user) {
        queryClient.setQueryData<TeeTime>(['teeTime', teeTimeId], (old) => {
          if (!old) return old;

          const targetSlot = slotNumber
            ? old.slots?.find((s) => s.slotNumber === slotNumber && !s.user)
            : old.slots?.find((s) => !s.user);

          if (!targetSlot) return old;

          return {
            ...old,
            availableSlots: Math.max(0, old.availableSlots - 1),
            slots: old.slots?.map((slot) =>
              slot.slotNumber === targetSlot.slotNumber
                ? { ...slot, user: optimisticUser as User, userId: user.id }
                : slot
            ),
          };
        });
      }

      return { previousFeed, previousTeeTime };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['teeTimeFeed'], context.previousFeed);
      }
      if (context?.previousTeeTime) {
        queryClient.setQueryData(['teeTime', variables.teeTimeId], context.previousTeeTime);
      }
    },

    // Refetch after success or error to ensure consistency
    onSettled: (data, error, variables) => {
      // Delay refetch slightly to let animation complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['teeTimeFeed'] });
        queryClient.invalidateQueries({ queryKey: ['teeTime', variables.teeTimeId] });
        queryClient.invalidateQueries({ queryKey: ['userTeeTimes'] });
      }, 500);
    },
  });
}

export function useLeaveTeeTime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (teeTimeId: string) => {
      const response = await api.leaveTeeTime(teeTimeId);
      return response;
    },

    // Optimistic update - instantly show the user left
    onMutate: async (teeTimeId) => {
      await queryClient.cancelQueries({ queryKey: ['teeTimeFeed'] });
      await queryClient.cancelQueries({ queryKey: ['teeTime', teeTimeId] });

      const previousFeed = queryClient.getQueryData<InfiniteData<FeedPage>>(['teeTimeFeed']);
      const previousTeeTime = queryClient.getQueryData<TeeTime>(['teeTime', teeTimeId]);

      // Optimistically update feed
      if (previousFeed && user) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(['teeTimeFeed'], (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((tt) => {
                if (tt.id !== teeTimeId) return tt;

                const userSlot = tt.slots?.find((s) => s.user?.id === user.id);
                if (!userSlot) return tt;

                return {
                  ...tt,
                  availableSlots: tt.availableSlots + 1,
                  slots: tt.slots?.map((slot) =>
                    slot.slotNumber === userSlot.slotNumber
                      ? { ...slot, user: undefined, userId: undefined }
                      : slot
                  ),
                };
              }),
            })),
          };
        });
      }

      // Optimistically update single tee time
      if (previousTeeTime && user) {
        queryClient.setQueryData<TeeTime>(['teeTime', teeTimeId], (old) => {
          if (!old) return old;

          const userSlot = old.slots?.find((s) => s.user?.id === user.id);
          if (!userSlot) return old;

          return {
            ...old,
            availableSlots: old.availableSlots + 1,
            slots: old.slots?.map((slot) =>
              slot.slotNumber === userSlot.slotNumber
                ? { ...slot, user: undefined, userId: undefined }
                : slot
            ),
          };
        });
      }

      return { previousFeed, previousTeeTime };
    },

    onError: (err, teeTimeId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['teeTimeFeed'], context.previousFeed);
      }
      if (context?.previousTeeTime) {
        queryClient.setQueryData(['teeTime', teeTimeId], context.previousTeeTime);
      }
    },

    onSettled: (data, error, teeTimeId) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['teeTimeFeed'] });
        queryClient.invalidateQueries({ queryKey: ['teeTime', teeTimeId] });
        queryClient.invalidateQueries({ queryKey: ['userTeeTimes'] });
      }, 500);
    },
  });
}
