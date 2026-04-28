import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _QuickActionApi } from '../api/services';

export const useFetchQuickActions = (
  page: number = 1,
  perPage: number = 10,
  search?: string
) =>
  useQuery({
    queryKey: queryKeys.quickAction.list({ page, per_page: perPage, search }),
    queryFn: () => _QuickActionApi.getList({ page, per_page: perPage, search }),
  });

export const useFetchQuickActionById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.quickAction.details(id),
    queryFn: () => _QuickActionApi.getById(id),
    enabled: !!id,
  });

export const useCreateQuickAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => _QuickActionApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickAction', 'list'] });
    },
  });
};

export const useUpdateQuickAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number | string; formData: FormData }) =>
      _QuickActionApi.update(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quickAction', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.quickAction.details(variables.id) });
    },
  });
};

export const useDeleteQuickAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _QuickActionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickAction', 'list'] });
    },
  });
};
