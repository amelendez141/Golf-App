'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TeeTime, ApiResponse } from '@/lib/types';

interface JoinParams {
  teeTimeId: string;
  slotNumber?: number;
}

export function useJoinTeeTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teeTimeId, slotNumber }: JoinParams) => {
      const response = await api.joinTeeTime(teeTimeId, slotNumber);
      return response.data;
    },
    onMutate: async ({ teeTimeId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['teeTimeFeed'] });
      await queryClient.cancelQueries({ queryKey: ['teeTime', teeTimeId] });

      return {};
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure data is correct
      queryClient.invalidateQueries({ queryKey: ['teeTimeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['teeTime', variables.teeTimeId] });
    },
  });
}

export function useLeaveTeeTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teeTimeId: string) => {
      const response = await api.leaveTeeTime(teeTimeId);
      return response;
    },
    onMutate: async (teeTimeId) => {
      await queryClient.cancelQueries({ queryKey: ['teeTimeFeed'] });
      await queryClient.cancelQueries({ queryKey: ['teeTime', teeTimeId] });

      return {};
    },
    onSettled: (data, error, teeTimeId) => {
      queryClient.invalidateQueries({ queryKey: ['teeTimeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['teeTime', teeTimeId] });
    },
  });
}
