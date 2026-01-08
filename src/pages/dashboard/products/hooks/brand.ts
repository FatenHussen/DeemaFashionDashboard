import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api';
import { _BrandApi } from '../api/brand.services';
import type { BrandCreateUpdatePayload } from '../types/brand.types';

export const useFetchBrands = (params?: { name?: string }) => {
  return useQuery({
    queryKey: queryKeys.brand.list(params),
    queryFn: () => _BrandApi.getListBrands(params),
  });
};

export const useFetchBrandById = (id: number | string) => {
  return useQuery({
    queryKey: queryKeys.brand.details(id),
    queryFn: () => _BrandApi.getBrandById(id),
    enabled: !!id,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BrandCreateUpdatePayload) => _BrandApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brand.list() });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: BrandCreateUpdatePayload }) =>
      _BrandApi.updateBrand(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brand.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.brand.details(variables.id) });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _BrandApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brand.list() });
    },
  });
};
