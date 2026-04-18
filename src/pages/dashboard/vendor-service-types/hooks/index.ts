import type { VendorServiceTypePayload } from '../types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _VendorServiceTypeApi } from '../api/services';

export const useFetchVendorServiceTypes = (
  page: number = 1,
  perPage: number = 10,
  search?: string
) =>
  useQuery({
    queryKey: queryKeys.vendorServiceType.list({ page, per_page: perPage, search }),
    queryFn: () => _VendorServiceTypeApi.getList({ page, per_page: perPage, search }),
  });

export const useFetchVendorServiceTypeById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.vendorServiceType.details(id),
    queryFn: () => _VendorServiceTypeApi.getById(id),
    enabled: !!id,
  });

export const useCreateVendorServiceType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorServiceTypePayload) => _VendorServiceTypeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorServiceType', 'list'] });
    },
  });
};

export const useUpdateVendorServiceType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<VendorServiceTypePayload> }) =>
      _VendorServiceTypeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorServiceType', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendorServiceType.details(variables.id),
      });
    },
  });
};

export const useDeleteVendorServiceType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _VendorServiceTypeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorServiceType', 'list'] });
    },
  });
};
