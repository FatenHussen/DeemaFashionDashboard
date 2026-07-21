import type { FlashSaleWritePayload } from '../api/services';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _FlashSaleApi } from '../api/services';

export const useFetchFlashSales = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.flashSale.list({ page, per_page: perPage, ...params }),
    queryFn: () =>
      _FlashSaleApi.getList({
        page,
        per_page: perPage,
        ...params,
      }),
  });

export const useCreateFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FlashSaleWritePayload) => _FlashSaleApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashSale', 'list'] });
    },
  });
};

export const useUpdateFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: FlashSaleWritePayload }) =>
      _FlashSaleApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashSale', 'list'] });
    },
  });
};
