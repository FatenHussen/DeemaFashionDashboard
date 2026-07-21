import { queryKeys } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  _ProductExtraDetailApi,
  type ProductExtraDetailCreateUpdatePayload,
  type ProductExtraDetailListParams,
} from '../api/product-extra-detail.services';

export type UseFetchProductExtraDetailsOptions = {
  enabled?: boolean;
};

export const useFetchProductExtraDetails = (
  filters: ProductExtraDetailListParams = {},
  options?: UseFetchProductExtraDetailsOptions
) =>
  useQuery({
    queryKey: queryKeys.productExtraDetail.list(filters as Record<string, unknown>),
    queryFn: () => _ProductExtraDetailApi.getListProductExtraDetails(filters),
    enabled: options?.enabled !== false,
  });

export const useFetchProductExtraDetailById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.productExtraDetail.details(id),
    queryFn: () => _ProductExtraDetailApi.getProductExtraDetailById(id),
    enabled: !!id,
  });

export const useCreateProductExtraDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductExtraDetailCreateUpdatePayload) =>
      _ProductExtraDetailApi.createProductExtraDetail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['productextradetail', 'list'],
        refetchType: 'active',
      });
      queryClient.refetchQueries({
        queryKey: ['productextradetail', 'list'],
        type: 'active',
      });
    },
  });
};

export const useUpdateProductExtraDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: ProductExtraDetailCreateUpdatePayload;
    }) => _ProductExtraDetailApi.updateProductExtraDetail(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['productextradetail', 'list'],
        refetchType: 'active',
      });
      queryClient.refetchQueries({
        queryKey: ['productextradetail', 'list'],
        type: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.productExtraDetail.details(variables.id),
      });
    },
  });
};

export const useDeleteProductExtraDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _ProductExtraDetailApi.deleteProductExtraDetail(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ['productextradetail', 'list'],
        refetchType: 'active',
      });
      queryClient.refetchQueries({
        queryKey: ['productextradetail', 'list'],
        type: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.productExtraDetail.details(id),
      });
    },
  });
};
