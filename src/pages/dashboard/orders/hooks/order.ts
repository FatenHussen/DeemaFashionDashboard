import type { AssignDriverPayload, ChangeItemStatusPayload, ChangeOrderStatusPayload } from '../types/order.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _OrderApi } from '../api/order.services';

export const useFetchOrders = (
  page: number = 1,
  perPage: number = 10,
  status?: string,
  search?: string,
  sortField?: string,
  sortOrder?: 'asc' | 'desc'
) =>
  useQuery({
    queryKey: queryKeys.order.list({ page, per_page: perPage, status }),
    queryFn: () =>
      _OrderApi.getListOrders({
        page,
        per_page: perPage,
        status,
        search,
        sort_field: sortField,
        sort_order: sortOrder,
      }),
  });

export const useFetchOrderById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.order.details(id),
    queryFn: () => _OrderApi.getOrderById(id),
    enabled: !!id,
  });

export const useChangeOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ChangeOrderStatusPayload }) =>
      _OrderApi.changeOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.order.details(variables.id) });
    },
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: AssignDriverPayload }) =>
      _OrderApi.assignDriver(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.order.details(variables.id) });
    },
  });
};

export const useChangeItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number | string; data: ChangeItemStatusPayload }) =>
      _OrderApi.changeItemStatus(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};
