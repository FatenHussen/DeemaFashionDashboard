import type { ScheduleCreatePayload } from '../types/schedule.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ScheduleApi } from '../api/schedule.services';

export const useFetchSchedules = (page: number = 1, perPage: number = 10, filters?: { is_active?: string; search?: string }) =>
  useQuery({
    queryKey: queryKeys.schedule.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _ScheduleApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchScheduleById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.schedule.details(id),
    queryFn: () => _ScheduleApi.getById(id),
    enabled: !!id,
  });

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleCreatePayload) => _ScheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', 'list'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<ScheduleCreatePayload> }) =>
      _ScheduleApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedule', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.details(variables.id) });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _ScheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', 'list'] });
    },
  });
};
