import type { BadgeCreatePayload } from '../types/badge.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _BadgeApi } from '../api/badge.services';

export const useFetchBadges = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.badge.list({ page, per_page: perPage, ...params }),
    queryFn: () => _BadgeApi.getListBadges({ page, per_page: perPage, ...params }),
  });

export const useFetchBadgeById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.badge.details(id),
    queryFn: () => _BadgeApi.getBadgeById(id),
    enabled: !!id,
  });

export const useCreateBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BadgeCreatePayload) => _BadgeApi.createBadge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badge', 'list'] });
    },
  });
};

export const useUpdateBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<BadgeCreatePayload> }) =>
      _BadgeApi.updateBadge(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['badge', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.badge.details(variables.id) });
    },
  });
};

export const useDeleteBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _BadgeApi.deleteBadge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badge', 'list'] });
    },
  });
};
