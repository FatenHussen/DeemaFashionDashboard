import type { SubscriptionListParams } from '../types/subscription.types';

import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _SubscriptionApi } from '../api/subscription.services';

export const useFetchSubscriptions = (params?: SubscriptionListParams) =>
  useQuery({
    queryKey: queryKeys.subscription.list(params),
    queryFn: () => _SubscriptionApi.getListSubscriptions(params),
  });

export const useFetchSubscriptionById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.subscription.details(id),
    queryFn: () => _SubscriptionApi.getSubscriptionById(id),
    enabled: !!id,
  });
