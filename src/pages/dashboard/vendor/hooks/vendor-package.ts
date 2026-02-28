import type { VendorPackageCreateUpdatePayload } from '../types/vendor-package.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _VendorPackageApi } from '../api/vendor-package.services';

export const useFetchVendorPackages = (
  page: number = 1,
  perPage: number = 10,
  filters?: {
    sort_field?: string;
    sort_order?: string;
    is_active?: number;
    min_price?: number;
    max_price?: number;
    slug?: string;
    search?: string;
  }
) =>
  useQuery({
    queryKey: queryKeys.vendorPackage.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _VendorPackageApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchVendorPackageById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.vendorPackage.details(id),
    queryFn: () => _VendorPackageApi.getById(id),
    enabled: !!id,
  });

export const useCreateVendorPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorPackageCreateUpdatePayload) => _VendorPackageApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorPackage', 'list'] });
    },
  });
};

export const useUpdateVendorPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: VendorPackageCreateUpdatePayload }) =>
      _VendorPackageApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorPackage', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorPackage.details(variables.id) });
    },
  });
};

export const useDeleteVendorPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _VendorPackageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorPackage', 'list'] });
    },
  });
};
