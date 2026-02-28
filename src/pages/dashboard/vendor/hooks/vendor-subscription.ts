import type { VendorSubscriptionFilters } from '../types/vendor-subscription.types';

import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _VendorSubscriptionApi } from '../api/vendor-subscription.services';

export const useFetchVendorSubscriptions = (
  page: number = 1,
  perPage: number = 10,
  filters?: VendorSubscriptionFilters
) =>
  useQuery({
    queryKey: queryKeys.vendorSubscription.list({ page, per_page: perPage, ...filters }),
    queryFn: () =>
      _VendorSubscriptionApi.getList({
        page,
        per_page: perPage,
        sort_field: 'id',
        sort_order: 'desc',
        ...filters,
      }),
  });

export const useFetchVendorSubscriptionById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.vendorSubscription.details(id),
    queryFn: () => _VendorSubscriptionApi.getById(id),
    enabled: !!id,
  });
