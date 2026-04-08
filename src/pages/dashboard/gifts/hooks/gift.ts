import type { GiftCreateUpdatePayload, BulkGiftCreatePayload } from '../types/gift.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _GiftApi } from '../api/gift.services';

export const useFetchGifts = (page: number = 1, perPage: number = 10) =>
  useQuery({
    queryKey: queryKeys.gift.list({ page, per_page: perPage }),
    queryFn: () => _GiftApi.getListGifts({ page, per_page: perPage }),
  });

export const useFetchGiftById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.gift.details(id),
    queryFn: () => _GiftApi.getGiftById(id),
    enabled: !!id,
  });

export const useCreateGift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GiftCreateUpdatePayload) => _GiftApi.createGift(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gift', 'list'] }); },
  });
};

export const useUpdateGift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: GiftCreateUpdatePayload }) =>
      _GiftApi.updateGift(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gift', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.gift.details(variables.id) });
    },
  });
};

export const useDeleteGift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _GiftApi.deleteGift(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gift', 'list'] }); },
  });
};

export const useBulkCreateGifts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkGiftCreatePayload) => _GiftApi.bulkCreateGifts(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gift', 'list'] }); },
  });
};
