import type { PointRuleCreatePayload } from '../types/point-rule.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PointRuleApi } from '../api/point-rule.services';

export const useFetchPointRules = (page: number = 1, perPage: number = 10, filters?: { is_active?: string; search?: string }) =>
  useQuery({
    queryKey: queryKeys.pointRule.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _PointRuleApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchPointRuleById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.pointRule.details(id),
    queryFn: () => _PointRuleApi.getById(id),
    enabled: !!id,
  });

export const useCreatePointRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PointRuleCreatePayload) => _PointRuleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointRule', 'list'] });
    },
  });
};

export const useUpdatePointRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<PointRuleCreatePayload> }) =>
      _PointRuleApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pointRule', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.pointRule.details(variables.id) });
    },
  });
};

export const useDeletePointRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _PointRuleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointRule', 'list'] });
    },
  });
};
