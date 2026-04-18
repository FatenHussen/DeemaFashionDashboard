import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  _CategoryAttributeApi,
  type CategoryAttributeListParams,
  type CategoryAttributeCreateUpdatePayload,
} from '../api/category-attribute.services';

export type UseFetchCategoryAttributesOptions = {
  enabled?: boolean;
  /** When true, the query runs only after `filters.category_id` is set. */
  requireCategoryId?: boolean;
};

export const useFetchCategoryAttributes = (
  filters: CategoryAttributeListParams = {},
  options?: UseFetchCategoryAttributesOptions
) =>
  useQuery({
    queryKey: queryKeys.categoryAttribute.list(filters as Record<string, unknown>),
    queryFn: () => _CategoryAttributeApi.getListCategoryAttributes(filters),
    enabled:
      options?.enabled !== false &&
      (!options?.requireCategoryId ||
        (filters.category_id != null && `${filters.category_id}` !== '')),
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
