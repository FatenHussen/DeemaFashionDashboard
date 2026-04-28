import type { AffiliateWithdrawUpdatePayload } from '../types/affiliate-withdraw.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _AffiliateWithdrawApi } from '../api/affiliate-withdraw.services';

export const useFetchAffiliateWithdrawRequests = (
  page: number = 1,
  perPage: number = 10,
  filters?: { status?: string; affiliate_id?: string; search?: string }
) =>
  useQuery({
    queryKey: queryKeys.affiliateWithdraw.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _AffiliateWithdrawApi.getListRequests({ page, per_page: perPage, ...filters }),
  });

export const useFetchAffiliateWithdrawById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.affiliateWithdraw.details(id),
    queryFn: () => _AffiliateWithdrawApi.getRequestById(id),
    enabled: !!id,
  });

export const useUpdateAffiliateWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: AffiliateWithdrawUpdatePayload }) =>
      _AffiliateWithdrawApi.updateRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['affiliateWithdraw', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateWithdraw.details(variables.id) });
    },
  });
};
