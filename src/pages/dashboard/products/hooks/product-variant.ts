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

/**
 * Deletes a product variant. `confirm` acknowledges the impact the API reported in its
 * `409` — without it a variant with linked data is not deleted (see `useVariantDeleteFlow`).
 */
export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirm }: { id: number | string; confirm?: boolean }) =>
      _ProductVariantApi.delete(id, { confirm }),
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

/** Deletes a shop link. Same `confirm` contract as `useDeleteProductVariant`. */
export const useDeleteShopProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirm }: { id: number | string; confirm?: boolean }) =>
      _ShopProductVariantApi.delete(id, { confirm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['shopProductVariant', 'list'] });
    },
  });
};
