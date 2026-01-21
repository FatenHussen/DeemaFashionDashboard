import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  _CategoryDetailApi,
  type CategoryDetailCreateUpdatePayload,
} from '../api/category-detail.services';

export const useFetchCategoryDetails = (page: number = 1, limit: number = 25) => useQuery({
    queryKey: queryKeys.categoryDetail.list({ page, limit }),
    queryFn: () => _CategoryDetailApi.getListCategoryDetails(page, limit),
  });

export const useFetchCategoryDetailById = (id: number | string) => useQuery({
    queryKey: queryKeys.categoryDetail.details(id),
    queryFn: () => _CategoryDetailApi.getCategoryDetailById(id),
    enabled: !!id,
  });

export const useCreateCategoryDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryDetailCreateUpdatePayload) =>
      _CategoryDetailApi.createCategoryDetail(data),
    onSuccess: () => {
      // Invalidate all category detail list queries
      queryClient.invalidateQueries({
        queryKey: ['categorydetail', 'list'],
        refetchType: 'active',
      });
      // Explicitly refetch all active category detail list queries
      queryClient.refetchQueries({
        queryKey: ['categorydetail', 'list'],
        type: 'active',
      });
    },
  });
};

export const useUpdateCategoryDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: CategoryDetailCreateUpdatePayload;
    }) => _CategoryDetailApi.updateCategoryDetail(id, data),
    onSuccess: (_, variables) => {
      // Invalidate all category detail list queries
      queryClient.invalidateQueries({
        queryKey: ['categorydetail', 'list'],
        refetchType: 'active',
      });

      // Explicitly refetch all active category detail list queries
      queryClient.refetchQueries({
        queryKey: ['categorydetail', 'list'],
        type: 'active',
      });

      // Invalidate the specific category detail details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryDetail.details(variables.id),
      });
    },
  });
};

export const useDeleteCategoryDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _CategoryDetailApi.deleteCategoryDetail(id),
    onSuccess: (_, id) => {
      // Invalidate all category detail list queries
      queryClient.invalidateQueries({
        queryKey: ['categorydetail', 'list'],
        refetchType: 'active',
      });

      // Explicitly refetch all active category detail list queries
      queryClient.refetchQueries({
        queryKey: ['categorydetail', 'list'],
        type: 'active',
      });

      // Invalidate the specific category detail details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryDetail.details(id),
      });
    },
  });
};
