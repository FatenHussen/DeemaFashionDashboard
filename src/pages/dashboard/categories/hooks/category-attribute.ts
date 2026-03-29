import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  _CategoryAttributeApi,
  type CategoryAttributeCreateUpdatePayload,
} from '../api/category-attribute.services';

export type UseFetchCategoryAttributesOptions = {
  /** When true, the query runs only after a category is selected (sends `category_id` and avoids listing all attributes). */
  requireCategoryId?: boolean;
};

export const useFetchCategoryAttributes = (
  categoryId: number | string | undefined,
  page: number = 1,
  limit: number = 25,
  options?: UseFetchCategoryAttributesOptions
) =>
  useQuery({
    queryKey: queryKeys.categoryAttribute.list({ categoryId, page, limit }),
    queryFn: () => _CategoryAttributeApi.getListCategoryAttributes(page, limit, categoryId),
    enabled: options?.requireCategoryId ? !!categoryId : true,
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
      queryClient.invalidateQueries({
        queryKey: ['categoryattribute', 'list'],
        refetchType: 'active',
      });
      queryClient.refetchQueries({
        queryKey: ['categoryattribute', 'list'],
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
      queryClient.invalidateQueries({
        queryKey: ['categoryattribute', 'list'],
        refetchType: 'active',
      });
      queryClient.refetchQueries({
        queryKey: ['categoryattribute', 'list'],
        type: 'active',
      });
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
      queryClient.invalidateQueries({
        queryKey: ['categoryattribute', 'list'],
        refetchType: 'active',
      });
      queryClient.refetchQueries({
        queryKey: ['categoryattribute', 'list'],
        type: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryAttribute.details(id),
      });
    },
  });
};
