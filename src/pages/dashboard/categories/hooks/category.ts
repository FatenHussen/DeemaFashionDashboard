import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _CategoryApi, type CategoryCreateUpdatePayload } from '../api/category.services';

export type CategoryListFilter = {
  /** Filter by parent: `0` or `null` = root categories (API: `parent_id=null`); positive id = direct children. */
  parent_id?: number | null;
  /** Alternative API param for listing children (some backends use this instead of `parent_id`). */
  category_id?: number;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  /** Admin list filter — sent as `name` query param. */
  name?: string;
  is_active?: 0 | 1 | boolean;
  is_restaurant?: 0 | 1 | boolean;
};

export const useFetchCategories = (
  page: number = 1,
  limit: number = 25,
  filter?: CategoryListFilter,
  queryOptions?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: queryKeys.category.list({
      page,
      limit,
      parent_id: filter?.parent_id,
      category_id: filter?.category_id,
      sort_field: filter?.sort_field,
      sort_order: filter?.sort_order,
      search: filter?.search,
      name: filter?.name,
      is_active: filter?.is_active,
      is_restaurant: filter?.is_restaurant,
    }),
    queryFn: () =>
      _CategoryApi.getListCategoriesPaginated({
        page,
        per_page: limit,
        parent_id: filter?.parent_id,
        category_id: filter?.category_id,
        sort_field: filter?.sort_field,
        sort_order: filter?.sort_order,
        search: filter?.search,
        name: filter?.name,
        is_active: filter?.is_active,
        is_restaurant: filter?.is_restaurant,
      }),
    enabled: queryOptions?.enabled !== false,
  });

export const useFetchCategoryById = (id: number | string) => useQuery({
    queryKey: queryKeys.category.details(id),
    queryFn: () => _CategoryApi.getCategoryById(id),
    enabled: !!id,
  });

export const useCreateCategory = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreateUpdatePayload) => _CategoryApi.createCategory(data),
    onSuccess: () => {
      // Invalidate all category list queries (matches all queries starting with ['category', 'list'])
      queryClient.invalidateQueries({
        queryKey: ['category', 'list'],
        refetchType: 'active',
      });
      // Explicitly refetch all active category list queries
      queryClient.refetchQueries({
        queryKey: ['category', 'list'],
        type: 'active',
      });
    },
  });
};

export const useUpdateCategory = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: CategoryCreateUpdatePayload }) =>
      _CategoryApi.updateCategory(id, data),
    onSuccess: (_, variables) => {
      // Invalidate all category list queries (matches all queries starting with ['category', 'list'])
      queryClient.invalidateQueries({
        queryKey: ['category', 'list'],
        refetchType: 'active',
      });

      // Explicitly refetch all active category list queries
      queryClient.refetchQueries({
        queryKey: ['category', 'list'],
        type: 'active',
      });

      // Invalidate the specific category details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.category.details(variables.id),
      });
    },
  });
};

export const useSortCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { ordered_ids: number[]; parent_id?: number | null }) =>
      _CategoryApi.sortCategories(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['category', 'list'],
        refetchType: 'active',
      });
      queryClient.refetchQueries({
        queryKey: ['category', 'list'],
        type: 'active',
      });
    },
  });
};

export const useDeleteCategory = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _CategoryApi.deleteCategory(id),
    onSuccess: (_, id) => {
      // Invalidate all category list queries (matches all queries starting with ['category', 'list'])
      queryClient.invalidateQueries({
        queryKey: ['category', 'list'],
        refetchType: 'active',
      });

      // Explicitly refetch all active category list queries
      queryClient.refetchQueries({
        queryKey: ['category', 'list'],
        type: 'active',
      });

      // Invalidate the specific category details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.category.details(id),
      });
    },
  });
};
