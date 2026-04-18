import type { UpdateWithdrawPayload } from '../types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _VendorAccountingApi } from '../api/services';

export const useFetchVendorAccountingSummary = (params?: {
  from_date?: string;
  to_date?: string;
  settlement_cycle?: 'weekly' | 'monthly';
}) =>
  useQuery({
    queryKey: queryKeys.vendorAccounting.summary(params),
    queryFn: () => _VendorAccountingApi.getSummary(params),
  });

export const useFetchVendorAccounting = (params?: {
  search?: string;
  is_active?: boolean;
  from_date?: string;
  to_date?: string;
  settlement_cycle?: 'weekly' | 'monthly';
  page?: number;
  per_page?: number;
}) =>
  useQuery({
    queryKey: queryKeys.vendorAccounting.vendors(params),
    queryFn: () => _VendorAccountingApi.getVendors(params),
  });

export const useFetchVendorStatement = (
  vendorId: number | string,
  params?: {
    from_date?: string;
    to_date?: string;
    settlement_cycle?: 'weekly' | 'monthly';
    withdraw_status?: 'pending' | 'paid' | 'rejected';
    withdraw_per_page?: number;
    page?: number;
  }
) =>
  useQuery({
    queryKey: queryKeys.vendorAccounting.vendorStatement(
      vendorId,
      params as Record<string, unknown>
    ),
    queryFn: () => _VendorAccountingApi.getVendorStatement(vendorId, params),
    enabled: !!vendorId,
  });

export const useFetchWithdrawRequestDetail = (id: number | string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.vendorWithdrawRequest.details(id ?? '__none__'),
    queryFn: () => _VendorAccountingApi.getWithdrawRequest(id!),
    enabled: id != null && id !== '',
  });

export const useFetchWithdrawRequests = (params?: {
  status?: 'pending' | 'paid' | 'rejected';
  vendor_id?: number;
  payment_method?: 'bank_transfer' | 'cash' | 'wallet' | 'other';
  from?: string;
  to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}) =>
  useQuery({
    queryKey: queryKeys.vendorWithdrawRequest.list(params as Record<string, unknown>),
    queryFn: () => _VendorAccountingApi.getWithdrawRequests(params),
  });

export const useUpdateWithdrawRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateWithdrawPayload }) =>
      _VendorAccountingApi.updateWithdrawRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorWithdrawRequest', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['vendorWithdrawRequest', 'details'] });
      queryClient.invalidateQueries({ queryKey: ['vendorAccounting', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['vendorAccounting', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorAccounting', 'vendorStatement'] });
    },
  });
};
