import type { AffiliateWalletTransactionListParams } from '../types/affiliate-wallet-transaction.types';

import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _AffiliateWalletTransactionApi } from '../api/affiliate-wallet-transaction.services';

export const useFetchAffiliateWalletTransactions = (
  page: number = 1,
  perPage: number = 10,
  filters?: Omit<AffiliateWalletTransactionListParams, 'page' | 'per_page'>
) =>
  useQuery({
    queryKey: queryKeys.affiliateWalletTransaction.list({ page, per_page: perPage, ...filters }),
    queryFn: () =>
      _AffiliateWalletTransactionApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchAffiliateWalletTransactionById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.affiliateWalletTransaction.details(id),
    queryFn: () => _AffiliateWalletTransactionApi.getById(id),
    enabled: !!id,
  });
