import type { VendorServicePayload } from '../types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _VendorServiceApi } from '../api/services';

export const useFetchVendorServices = (page: number = 1, perPage: number = 10, search?: string) =>
  useQuery({
    queryKey: queryKeys.vendorService.list({ page, per_page: perPage, search }),
    queryFn: () => _VendorServiceApi.getList({ page, per_page: perPage, search }),
  });

export const useFetchVendorServiceById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.vendorService.details(id),
    queryFn: () => _VendorServiceApi.getById(id),
    enabled: !!id,
  });

export const useCreateVendorService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorServicePayload) => _VendorServiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorService', 'list'] });
    },
  });
};

export const useUpdateVendorService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<VendorServicePayload> }) =>
      _VendorServiceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorService', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorService.details(variables.id) });
    },
  });
};

export const useDeleteVendorService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _VendorServiceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorService', 'list'] });
    },
  });
};
