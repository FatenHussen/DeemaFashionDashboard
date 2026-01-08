import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api';
import { _VendorApi } from '../api/vendor.services';
import { VendorCreateUpdatePayload } from '../types/vendor.types';

export const useFetchVendors = (page: number = 1, limit: number = 25) => {
  return useQuery({
    queryKey: queryKeys.vendor.list({ page, limit }),
    queryFn: () => _VendorApi.getListVendor(),
  });
};

export const useFetchVendorById = (id: number | string) => {
  return useQuery({
    queryKey: queryKeys.vendor.details(id),
    queryFn: () => _VendorApi.getVendorById(id),
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorCreateUpdatePayload) => _VendorApi.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.list() });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: VendorCreateUpdatePayload }) =>
      _VendorApi.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.list() });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _VendorApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.list() });
    },
  });
};
