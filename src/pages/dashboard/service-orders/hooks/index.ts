import type { ServiceOrderStatus } from '../types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ServiceOrderApi } from '../api/services';

export const useFetchServiceOrders = (
  page: number = 1,
  perPage: number = 10,
  status?: string,
  search?: string
) =>
  useQuery({
    queryKey: queryKeys.serviceOrder.list({ page, per_page: perPage, status, search }),
    queryFn: () => _ServiceOrderApi.getList({ page, per_page: perPage, status, search }),
  });

export const useFetchServiceOrderById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.serviceOrder.details(id),
    queryFn: () => _ServiceOrderApi.getOne(id),
    enabled: !!id,
  });

export const useChangeServiceOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: ServiceOrderStatus }) =>
      _ServiceOrderApi.changeStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceOrder.details(variables.id),
      });
    },
  });
};
