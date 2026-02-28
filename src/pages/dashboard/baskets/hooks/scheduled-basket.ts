import type { ScheduledBasketCreateUpdatePayload } from '../types/scheduled-basket.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ScheduledBasketApi } from '../api/scheduled-basket.services';

export const useFetchScheduledBaskets = (page: number = 1, perPage: number = 10) =>
  useQuery({
    queryKey: queryKeys.scheduledBasket.list({ page, per_page: perPage }),
    queryFn: () => _ScheduledBasketApi.getListScheduledBaskets({ page, per_page: perPage }),
  });

export const useFetchScheduledBasketById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.scheduledBasket.details(id),
    queryFn: () => _ScheduledBasketApi.getScheduledBasketById(id),
    enabled: !!id,
  });

export const useCreateScheduledBasket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduledBasketCreateUpdatePayload) => _ScheduledBasketApi.createScheduledBasket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledBasket', 'list'] });
    },
  });
};

export const useUpdateScheduledBasket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ScheduledBasketCreateUpdatePayload }) =>
      _ScheduledBasketApi.updateScheduledBasket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledBasket', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledBasket.details(variables.id) });
    },
  });
};

export const useDeleteScheduledBasket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _ScheduledBasketApi.deleteScheduledBasket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledBasket', 'list'] });
    },
  });
};
