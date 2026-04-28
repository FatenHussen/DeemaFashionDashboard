import type { DriverWalletTransactionListParams } from '../types/driver-wallet-transaction.types';

import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _DriverWalletTransactionApi } from '../api/driver-wallet-transaction.services';

export const useFetchDriverWalletTransactions = (
  page: number = 1,
  perPage: number = 10,
  filters?: Omit<DriverWalletTransactionListParams, 'page' | 'per_page'>
) =>
  useQuery({
    queryKey: queryKeys.driverWalletTransaction.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _DriverWalletTransactionApi.getList({ page, per_page: perPage, ...filters }),
  });

export const useFetchDriverWalletTransactionById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.driverWalletTransaction.details(id),
    queryFn: () => _DriverWalletTransactionApi.getById(id),
    enabled: !!id,
  });
