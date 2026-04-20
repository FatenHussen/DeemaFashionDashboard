import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PromotionRequestApi } from '../api/promotion-request.services';

export const useFetchPromotionRequests = (page: number = 1, perPage: number = 10, status?: string, search?: string) =>
  useQuery({
    queryKey: queryKeys.promotionRequest.list({ page, per_page: perPage, status, search }),
    queryFn: () => _PromotionRequestApi.getList({ page, per_page: perPage, status, search }),
  });

export const useFetchPromotionRequestById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.promotionRequest.details(id),
    queryFn: () => _PromotionRequestApi.getById(id),
    enabled: !!id,
  });

export const useApprovePromotionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number | string; note?: string }) =>
      _PromotionRequestApi.approve(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotionRequest', 'list'] });
    },
  });
};

export const useRejectPromotionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number | string; note?: string }) =>
      _PromotionRequestApi.reject(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotionRequest', 'list'] });
    },
  });
};
