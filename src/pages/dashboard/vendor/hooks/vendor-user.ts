import type { VendorUserCreatePayload, VendorUserUpdatePayload } from '../types/vendor-user.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _VendorUserApi } from '../api/vendor-user.services';

export const useFetchVendorUsers = (page: number = 1, perPage: number = 10) =>
  useQuery({
    queryKey: queryKeys.vendorUser.list({ page, per_page: perPage }),
    queryFn: () => _VendorUserApi.getList({ page, per_page: perPage }),
  });

export const useFetchVendorUserById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.vendorUser.details(id),
    queryFn: () => _VendorUserApi.getById(id),
    enabled: !!id,
  });

export const useFetchShopsByVendor = (vendorId: number | string | undefined) =>
  useQuery({
    queryKey: ['shops', 'by-vendor', vendorId],
    queryFn: () => _VendorUserApi.getShopsByVendor(vendorId!),
    enabled: !!vendorId && vendorId !== 0,
  });

export const useCreateVendorUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorUserCreatePayload) => _VendorUserApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorUser', 'list'] });
    },
  });
};

export const useUpdateVendorUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: VendorUserUpdatePayload }) =>
      _VendorUserApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorUser', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorUser.details(variables.id) });
    },
  });
};

export const useDeleteVendorUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _VendorUserApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorUser', 'list'] });
    },
  });
};
