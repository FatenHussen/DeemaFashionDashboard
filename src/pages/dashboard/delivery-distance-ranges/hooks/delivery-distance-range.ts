import type { DeliveryDistanceRangePayload } from '../types/delivery-distance-range.types';

import { queryKeys } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { _DeliveryDistanceRangeApi } from '../api/delivery-distance-range.services';

export const useFetchDeliveryDistanceRanges = (page: number = 1, perPage: number = 10) =>
  useQuery({
    queryKey: queryKeys.deliveryDistanceRange.list({ page, per_page: perPage }),
    queryFn: () => _DeliveryDistanceRangeApi.getList({ page, per_page: perPage }),
  });

export const useFetchDeliveryDistanceRangeById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.deliveryDistanceRange.details(id),
    queryFn: () => _DeliveryDistanceRangeApi.getById(id),
    enabled: !!id,
  });

export const useCreateDeliveryDistanceRange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeliveryDistanceRangePayload) => _DeliveryDistanceRangeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryDistanceRange', 'list'] });
    },
  });
};

export const useUpdateDeliveryDistanceRange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: Partial<DeliveryDistanceRangePayload>;
    }) => _DeliveryDistanceRangeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryDistanceRange', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryDistanceRange.details(variables.id) });
    },
  });
};

export const useDeleteDeliveryDistanceRange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _DeliveryDistanceRangeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryDistanceRange', 'list'] });
    },
  });
};
