import type { FaqPayload } from '../types/faq.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _FaqApi } from '../api/faq.services';

export const useFetchFaqs = (
  page: number = 1,
  perPage: number = 10,
  filters?: { type?: string; search?: string }
) =>
  useQuery({
    queryKey: queryKeys.faq.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _FaqApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchFaqById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.faq.details(id),
    queryFn: () => _FaqApi.getById(id),
    enabled: !!id,
  });

export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FaqPayload) => _FaqApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq', 'list'] });
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: FaqPayload }) =>
      _FaqApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faq', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.faq.details(variables.id) });
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _FaqApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq', 'list'] });
    },
  });
};
