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
    mutationFn: ({
      id,
      data,
      queryId,
    }: {
      id: number | string;
      data: ChangeOrderStatusPayload;
      /** Use this for refetch to match the query key (e.g. route param string) */
      queryId?: number | string;
    }) => _OrderApi.changeOrderStatus(id, data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', 'list'] });
      const refetchId = variables.queryId ?? variables.id;
      await queryClient.refetchQueries({ queryKey: queryKeys.order.details(refetchId) });
    },
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      queryId,
    }: {
      id: number | string;
      data: AssignDriverPayload;
      queryId?: number | string;
    }) => _OrderApi.assignDriver(id, data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', 'list'] });
      const refetchId = variables.queryId ?? variables.id;
      await queryClient.refetchQueries({ queryKey: queryKeys.order.details(refetchId) });
    },
  });
};

export const useChangeItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
      orderId,
      queryId,
    }: {
      itemId: number | string;
      data: ChangeItemStatusPayload;
      orderId?: number | string;
      /** Use this for refetch to match the query key (e.g. route param string) */
      queryId?: number | string;
    }) => _OrderApi.changeItemStatus(itemId, data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', 'list'] });
      const refetchId = variables.queryId ?? variables.orderId;
      if (refetchId != null) {
        await queryClient.refetchQueries({
          queryKey: queryKeys.order.details(refetchId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['order'] });
      }
    },
  });
};
