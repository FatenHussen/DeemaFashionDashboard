import type { SubscriptionCreateUpdatePayload } from '../types/subscription.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _SubscriptionApi } from '../api/subscription.services';

export const useFetchSubscriptions = (page: number = 1, perPage: number = 10) =>
  useQuery({
    queryKey: queryKeys.subscription.list({ page, per_page: perPage }),
    queryFn: () => _SubscriptionApi.getListSubscriptions({ page, per_page: perPage }),
  });

export const useFetchSubscriptionById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.subscription.details(id),
    queryFn: () => _SubscriptionApi.getSubscriptionById(id),
    enabled: !!id,
  });

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionCreateUpdatePayload) => _SubscriptionApi.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'list'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: SubscriptionCreateUpdatePayload }) =>
      _SubscriptionApi.updateSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.details(variables.id) });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _SubscriptionApi.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'list'] });
    },
  });
};
