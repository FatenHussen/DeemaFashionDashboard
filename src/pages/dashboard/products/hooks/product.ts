import type { ProductCreateUpdatePayload } from '../types/product.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ProductApi } from '../api/product.services';

export const useFetchProducts = (params?: {
  page?: number;
  limit?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_order?: string;
  shop_id?: number;
  category_id?: number;
  brand_id?: number;
  vendor_id?: number;
  approval_status?: string;
  is_visible?: boolean;
}) =>
  useQuery({
    queryKey: queryKeys.product.list(params),
    queryFn: () =>
      _ProductApi.getListProducts({
        ...params,
        per_page: params?.per_page ?? params?.limit,
      }),
  });

export const useFetchProductById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.product.details(id),
    queryFn: () => _ProductApi.getProductById(id),
    enabled: !!id,
    /** Avoid refetch wiping the edit form (and file fields) on focus / background invalidation. */
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateUpdatePayload) => _ProductApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ProductCreateUpdatePayload }) =>
      _ProductApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.product.details(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _ProductApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
    },
  });
};

export const useApproveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _ProductApi.approveProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.product.details(id) });
    },
  });
};

export const useRejectProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: number | string; rejection_reason: string }) =>
      _ProductApi.rejectProduct(id, rejection_reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.product.details(id) });
    },
  });
};
