'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User, UserProfile } from '@/lib/types';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.getCurrentUser();
      return response.data;
    },
    enabled: false, // Disabled until auth is configured
    staleTime: 60000,
    gcTime: 300000,
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const response = await api.getUserProfile(userId);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 60000,
    gcTime: 300000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.updateProfile(data);
      return response.data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['currentUser'] });
      const previousUser = queryClient.getQueryData<User>(['currentUser']);

      if (previousUser) {
        queryClient.setQueryData<User>(['currentUser'], {
          ...previousUser,
          ...newData,
        });
      }

      return { previousUser };
    },
    onError: (err, newData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['currentUser'], context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
