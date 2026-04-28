import type { ShopProductVariantUpdatePayload } from '@/shared/api/shop-product-variant.services';
import type { ProductVariantUpdatePayload } from '../api/product-variant.services';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';

import { _ProductVariantApi } from '../api/product-variant.services';

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ProductVariantUpdatePayload }) =>
      _ProductVariantApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
    },
  });
};

export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _ProductVariantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
    },
  });
};

export const useUpdateShopProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ShopProductVariantUpdatePayload }) =>
      _ShopProductVariantApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['product', 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['shopProductVariant', 'list'] });
    },
  });
};

export const useDeleteShopProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _ShopProductVariantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['shopProductVariant', 'list'] });
    },
  });
};
