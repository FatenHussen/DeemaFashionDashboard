import type { PromotionCreatePayload, PromotionUpdatePayload } from '../types/promotion.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PromotionApi } from '../api/promotion.services';

export const useFetchPromotions = (page: number = 1, perPage: number = 10) =>
  useQuery({
    queryKey: queryKeys.promotion.list({ page, per_page: perPage }),
    queryFn: () => _PromotionApi.getListPromotions({ page, per_page: perPage }),
  });

export const useFetchPromotionById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.promotion.details(id),
    queryFn: () => _PromotionApi.getPromotionById(id),
    enabled: !!id,
  });

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PromotionCreatePayload) => _PromotionApi.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion', 'list'] });
    },
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: PromotionUpdatePayload }) =>
      _PromotionApi.updatePromotion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promotion', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.promotion.details(variables.id) });
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _PromotionApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion', 'list'] });
    },
  });
};
