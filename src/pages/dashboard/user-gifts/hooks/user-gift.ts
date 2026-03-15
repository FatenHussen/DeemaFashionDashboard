import type { UserGiftCreatePayload, UserGiftUpdatePayload } from '../types/user-gift.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _UserGiftApi } from '../api/user-gift.services';

export const useFetchUserGifts = (
  page: number = 1,
  perPage: number = 10,
  filters?: { user_id?: number; gift_id?: number; status?: string }
) =>
  useQuery({
    queryKey: queryKeys.userGift.list({ page, per_page: perPage, ...filters }),
    queryFn: () =>
      _UserGiftApi.getListUserGifts({
        page,
        per_page: perPage,
        ...filters,
      }),
  });

export const useFetchUserGiftById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.userGift.details(id),
    queryFn: () => _UserGiftApi.getUserGiftById(id),
    enabled: !!id,
  });

export const useCreateUserGift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserGiftCreatePayload) =>
      _UserGiftApi.createUserGift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGift', 'list'] });
    },
  });
};

export const useUpdateUserGift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UserGiftUpdatePayload;
    }) => _UserGiftApi.updateUserGift(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userGift', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userGift.details(variables.id),
      });
    },
  });
};

export const useDeleteUserGift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      _UserGiftApi.deleteUserGift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGift', 'list'] });
    },
  });
};
