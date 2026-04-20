import type { PointExchangeUpdateStatusPayload } from '../types/point-exchange.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PointExchangeApi } from '../api/point-exchange.services';

export const useFetchPointExchanges = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.pointExchange.list({ page, per_page: perPage, ...params }),
    queryFn: () => _PointExchangeApi.getListPointExchanges({ page, per_page: perPage, ...params }),
  });

export const useFetchPointExchangeById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.pointExchange.details(id),
    queryFn: () => _PointExchangeApi.getPointExchangeById(id),
    enabled: !!id,
  });

export const useUpdatePointExchangeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: PointExchangeUpdateStatusPayload }) =>
      _PointExchangeApi.updatePointExchangeStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pointExchange', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.pointExchange.details(variables.id) });
    },
  });
};
