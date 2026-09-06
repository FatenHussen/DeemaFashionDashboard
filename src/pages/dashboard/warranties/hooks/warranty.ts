import type { WarrantyCreateUpdatePayload } from '../types/warranty.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _WarrantyApi, type WarrantyListQueryParams } from '../api/warranty.services';

export const useFetchWarranties = (params?: WarrantyListQueryParams) =>
  useQuery({
    queryKey: queryKeys.warranty.list(params as Record<string, unknown>),
    queryFn: () => _WarrantyApi.getListWarranties(params),
  });

export const useFetchWarrantyById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.warranty.details(id),
    queryFn: () => _WarrantyApi.getWarrantyById(id),
    enabled: !!id,
  });

export const useCreateWarranty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WarrantyCreateUpdatePayload) => _WarrantyApi.createWarranty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty', 'list'] });
    },
  });
};

export const useUpdateWarranty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: WarrantyCreateUpdatePayload }) =>
      _WarrantyApi.updateWarranty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warranty', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.warranty.details(variables.id) });
    },
  });
};

export const useDeleteWarranty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _WarrantyApi.deleteWarranty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty', 'list'] });
    },
  });
};
