import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  _CategoryAttributeApi,
  type CategoryAttributeCreateUpdatePayload,
} from '../api/category-attribute.services';

export const useFetchCategoryAttributes = (categoryId: any, page: number = 1, limit: number = 25) =>
  useQuery({
    queryKey: queryKeys.categoryAttribute.list({ categoryId, page, limit }),
    queryFn: () => _CategoryAttributeApi.getListCategoryAttributes(page, limit),
    enabled: !!categoryId,
  });

export const useFetchCategoryAttributeById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.categoryAttribute.details(id),
    queryFn: () => _CategoryAttributeApi.getCategoryAttributeById(id),
    enabled: !!id,
  });

export const useCreateCategoryAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryAttributeCreateUpdatePayload) =>
      _CategoryAttributeApi.createCategoryAttribute(data),
    onSuccess: () => {
      // Invalidate all category attribute list queries (matches all queries starting with ['category-attribute', 'list'])
      queryClient.invalidateQueries({
        queryKey: ['category-attribute', 'list'],
        refetchType: 'active',
      });
      // Explicitly refetch all active category attribute list queries
      queryClient.refetchQueries({
        queryKey: ['category-attribute', 'list'],
        type: 'active',
      });
    },
  });
};

export const useUpdateCategoryAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: CategoryAttributeCreateUpdatePayload;
    }) => _CategoryAttributeApi.updateCategoryAttribute(id, data),
    onSuccess: (_, variables) => {
      // Invalidate all category attribute list queries (matches all queries starting with ['category-attribute', 'list'])
      queryClient.invalidateQueries({
        queryKey: ['category-attribute', 'list'],
        refetchType: 'active',
      });

      // Explicitly refetch all active category attribute list queries
      queryClient.refetchQueries({
        queryKey: ['category-attribute', 'list'],
        type: 'active',
      });

      // Invalidate the specific category attribute details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryAttribute.details(variables.id),
      });
    },
  });
};

export const useDeleteCategoryAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _CategoryAttributeApi.deleteCategoryAttribute(id),
    onSuccess: (_, id) => {
      // Invalidate all category attribute list queries (matches all queries starting with ['category-attribute', 'list'])
      queryClient.invalidateQueries({
        queryKey: ['category-attribute', 'list'],
        refetchType: 'active',
      });

      // Explicitly refetch all active category attribute list queries
      queryClient.refetchQueries({
        queryKey: ['category-attribute', 'list'],
        type: 'active',
      });

      // Invalidate the specific category attribute details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryAttribute.details(id),
      });
    },
  });
};
