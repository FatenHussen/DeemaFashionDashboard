import type { ContactMethodMutationPayload } from '../types/contact-method.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ContactMethodApi } from '../api/contact-method.services';

export const useFetchContactMethods = (
  page: number = 1,
  perPage: number = 10,
  filters?: {
    search?: string;
    sort_field?: string;
    sort_order?: string;
  }
) =>
  useQuery({
    queryKey: queryKeys.contactMethod.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _ContactMethodApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchContactMethodById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.contactMethod.details(id),
    queryFn: () => _ContactMethodApi.getById(id),
    enabled: !!id,
  });

export const useCreateContactMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactMethodMutationPayload) => _ContactMethodApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMethod', 'list'] });
    },
  });
};

export const useUpdateContactMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ContactMethodMutationPayload }) =>
      _ContactMethodApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contactMethod', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMethod.details(variables.id) });
    },
  });
};

export const useDeleteContactMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _ContactMethodApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMethod', 'list'] });
    },
  });
};
