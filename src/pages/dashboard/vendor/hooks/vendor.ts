import type { VendorCreateUpdatePayload } from '../types/vendor.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _VendorApi } from '../api/vendor.services';

export const useFetchVendors = (page: number = 1, limit: number = 25) =>
  useQuery({
    queryKey: queryKeys.vendor.list({ page, limit }),
    queryFn: () => _VendorApi.getListVendor({ page, limit }),
  });

export const useFetchVendorById = (id: number | string) => useQuery({
    queryKey: queryKeys.vendor.details(id),
    queryFn: () => _VendorApi.getVendorById(id),
    enabled: !!id,
  });

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorCreateUpdatePayload) => _VendorApi.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'list'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: VendorCreateUpdatePayload }) =>
      _VendorApi.updateVendor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.details(variables.id) });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _VendorApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'list'] });
    },
  });
};
