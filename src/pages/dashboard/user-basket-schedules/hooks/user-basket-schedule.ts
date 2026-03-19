import type { UserBasketScheduleCreatePayload } from '../types/user-basket-schedule.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _UserBasketScheduleApi } from '../api/user-basket-schedule.services';

export const useFetchUserBasketSchedules = (page: number = 1, perPage: number = 10, filters?: { is_active?: string; search?: string }) =>
  useQuery({
    queryKey: queryKeys.userBasketSchedule.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _UserBasketScheduleApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchUserBasketScheduleById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.userBasketSchedule.details(id),
    queryFn: () => _UserBasketScheduleApi.getById(id),
    enabled: !!id,
  });

export const useCreateUserBasketSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserBasketScheduleCreatePayload) => _UserBasketScheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBasketSchedule', 'list'] });
    },
  });
};

export const useUpdateUserBasketSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<UserBasketScheduleCreatePayload> }) =>
      _UserBasketScheduleApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userBasketSchedule', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.userBasketSchedule.details(variables.id) });
    },
  });
};

export const useDeleteUserBasketSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _UserBasketScheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBasketSchedule', 'list'] });
    },
  });
};
