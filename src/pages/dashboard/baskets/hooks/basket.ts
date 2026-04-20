import type { BasketCreateUpdatePayload } from '../types/basket.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _BasketApi } from '../api/basket.services';

export const useFetchBaskets = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.basket.list({ page, per_page: perPage, ...params }),
    queryFn: () => _BasketApi.getListBaskets({ page, per_page: perPage, ...params }),
  });

export const useFetchBasketById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.basket.details(id),
    queryFn: () => _BasketApi.getBasketById(id),
    enabled: !!id,
  });

export const useCreateBasket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BasketCreateUpdatePayload) => _BasketApi.createBasket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basket', 'list'] });
    },
  });
};

export const useUpdateBasket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: BasketCreateUpdatePayload }) =>
      _BasketApi.updateBasket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['basket', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.basket.details(variables.id) });
    },
  });
};

export const useDeleteBasket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _BasketApi.deleteBasket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basket', 'list'] });
    },
  });
};
