import type { ShopCreateUpdatePayload } from '../types/shop.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ShopApi } from '../api/shop.services';

export type UseFetchShopsOptions = {
  /** When set and > 0, passed as `vendor_id` query param. Omit for unfiltered list. */
  vendorId?: number;
  enabled?: boolean;
};

export const useFetchShops = (
  page: number = 1,
  limit: number = 25,
  opts?: UseFetchShopsOptions
) => {
  const vendorId = opts?.vendorId;
  const enabled = opts?.enabled ?? true;
  const listParams = {
    page,
    limit,
    ...(vendorId != null && vendorId > 0 ? { vendor_id: vendorId } : {}),
  };
  return useQuery({
    queryKey: queryKeys.shop.list(listParams),
    queryFn: () =>
      _ShopApi.getListShop({
        page,
        per_page: limit,
        ...(vendorId != null && vendorId > 0 ? { vendor_id: vendorId } : {}),
      }),
    enabled,
  });
};

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
      queryClient.invalidateQueries({ queryKey: ['shop', 'list'] });
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ShopCreateUpdatePayload }) =>
      _ShopApi.updateShop(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.shop.details(variables.id) });
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _ShopApi.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'list'] });
    },
  });
};
