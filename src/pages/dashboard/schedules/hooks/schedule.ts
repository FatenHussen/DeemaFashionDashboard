import type { ScheduleListParams, ScheduleCreatePayload, ScheduleUpdatePayload } from '../types/schedule.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ScheduleApi } from '../api/schedule.services';

export const useFetchSchedules = (params: ScheduleListParams = {}) => {
  const { page = 1, per_page = 10, ...rest } = params;
  return useQuery({
    queryKey: queryKeys.schedule.list({ page, per_page, ...rest }),
    queryFn: () => _ScheduleApi.getList({ page, per_page, ...rest }),
  });
};

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
    mutationFn: ({ id, data }: { id: number | string; data: ScheduleUpdatePayload }) =>
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
