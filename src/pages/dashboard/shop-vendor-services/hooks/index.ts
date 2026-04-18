import type {
  ShopVendorServiceCreatePayload,
  ShopVendorServiceUpdatePayload,
} from '../types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ShopVendorServiceApi } from '../api/services';

export const useFetchShopVendorServices = (
  page: number = 1,
  perPage: number = 10,
  search?: string
) =>
  useQuery({
    queryKey: queryKeys.shopVendorService.list({ page, per_page: perPage, search }),
    queryFn: () => _ShopVendorServiceApi.getList({ page, per_page: perPage, search }),
  });

export const useFetchShopVendorServiceById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.shopVendorService.details(id),
    queryFn: () => _ShopVendorServiceApi.getById(id),
    enabled: !!id,
  });

export const useCreateShopVendorService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShopVendorServiceCreatePayload) => _ShopVendorServiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopVendorService', 'list'] });
    },
  });
};

export const useUpdateShopVendorService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: ShopVendorServiceUpdatePayload;
    }) => _ShopVendorServiceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopVendorService', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.shopVendorService.details(variables.id),
      });
    },
  });
};

export const useDeleteShopVendorService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _ShopVendorServiceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopVendorService', 'list'] });
    },
  });
};
