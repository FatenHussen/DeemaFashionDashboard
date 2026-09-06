import type {
  CancelCustomOrderPayload,
  ConvertCustomOrderPayload,
  CustomOrderRequestListParams,
} from '../types/custom-order-request.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _CustomOrderRequestApi } from '../api/custom-order-request.services';

export const useFetchCustomOrderRequests = (params: CustomOrderRequestListParams = {}) =>
  useQuery({
    queryKey: queryKeys.customOrderRequest.list(params as Record<string, unknown>),
    queryFn: () => _CustomOrderRequestApi.getList(params),
  });

export const useFetchCustomOrderRequestById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.customOrderRequest.details(id),
    queryFn: () => _CustomOrderRequestApi.getById(id),
    enabled: !!id,
  });

export const useConvertCustomOrderRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: ConvertCustomOrderPayload }) =>
      _CustomOrderRequestApi.convert(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customOrderRequest', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customOrderRequest.details(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

export const useCancelCustomOrderRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: CancelCustomOrderPayload }) =>
      _CustomOrderRequestApi.cancel(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customOrderRequest', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customOrderRequest.details(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};
