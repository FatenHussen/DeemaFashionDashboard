import type { PackageCreateUpdatePayload } from '../types/package.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PackageApi } from '../api/package.services';

export const useFetchPackages = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.package.list({ page, per_page: perPage, ...params }),
    queryFn: () => _PackageApi.getListPackages({ page, per_page: perPage, ...params }),
  });

export const useFetchPackageById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.package.details(id),
    queryFn: () => _PackageApi.getPackageById(id),
    enabled: !!id,
  });

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PackageCreateUpdatePayload) => _PackageApi.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package', 'list'] });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: PackageCreateUpdatePayload }) =>
      _PackageApi.updatePackage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['package', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.package.details(variables.id) });
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _PackageApi.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package', 'list'] });
    },
  });
};
