import type { UserPointsAddDeductPayload } from '../types/user-points.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _UserPointsApi } from '../api/user-points.services';

export const useFetchUserPoints = (
  page: number = 1,
  perPage: number = 10,
  filters?: { search?: string; balance_min?: number; balance_max?: number }
) =>
  useQuery({
    queryKey: queryKeys.userPoints.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _UserPointsApi.getListUserPoints({ page, per_page: perPage, ...filters }),
  });

export const useFetchUserPointsById = (userId: number | string) =>
  useQuery({
    queryKey: queryKeys.userPoints.details(userId),
    queryFn: () => _UserPointsApi.getUserPointsById(userId),
    enabled: !!userId,
  });

export const useFetchUserPointsTransactions = (
  userId: number | string,
  page: number = 1,
  perPage: number = 20,
  filters?: { status?: string; source?: string; from_date?: string; to_date?: string }
) =>
  useQuery({
    queryKey: queryKeys.userPoints.transactions(userId, { page, per_page: perPage, ...filters }),
    queryFn: () =>
      _UserPointsApi.getUserPointsTransactions(userId, {
        page,
        per_page: perPage,
        ...filters,
      }),
    enabled: !!userId,
  });

export const useFetchUserPointsStatistics = () =>
  useQuery({
    queryKey: queryKeys.userPoints.statistics(),
    queryFn: () => _UserPointsApi.getStatistics(),
  });

export const useAddPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number | string; data: UserPointsAddDeductPayload }) =>
      _UserPointsApi.addPoints(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPoints', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.userPoints.details(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ['userPoints', 'transactions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['userPoints', 'statistics'] });
    },
  });
};

export const useDeductPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number | string; data: UserPointsAddDeductPayload }) =>
      _UserPointsApi.deductPoints(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPoints', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.userPoints.details(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ['userPoints', 'transactions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['userPoints', 'statistics'] });
    },
  });
};
