import type { ShopCreateUpdatePayload } from '../types/shop.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ShopApi } from '../api/shop.services';

export const useFetchShops = (page: number = 1, limit: number = 25) => useQuery({
    queryKey: queryKeys.shop.list({ page, limit }),
    queryFn: () => _ShopApi.getListShop(),
  });

export const useFetchShopById = (id: number | string) => useQuery({
    queryKey: queryKeys.shop.details(id),
    queryFn: () => _ShopApi.getShopById(id),
    enabled: !!id,
  });

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ShopCreateUpdatePayload) => _ShopApi.createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.list() });
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ShopCreateUpdatePayload }) =>
      _ShopApi.updateShop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.list() });
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _ShopApi.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.list() });
    },
  });
};
