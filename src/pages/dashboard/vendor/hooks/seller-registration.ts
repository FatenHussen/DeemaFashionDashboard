import type { SellerRegistrationApprovePayload } from '../types/seller-registration.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _SellerRegistrationApi } from '../api/seller-registration.services';

export const useFetchSellerRegistrations = (
  page: number = 1,
  perPage: number = 20,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.sellerRegistration.list({ page, per_page: perPage, ...params }),
    queryFn: () => _SellerRegistrationApi.getList({ page, per_page: perPage, ...params }),
  });

export const useFetchSellerRegistrationById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.sellerRegistration.details(id),
    queryFn: () => _SellerRegistrationApi.getById(id),
    enabled: !!id,
  });

export const useApproveSellerRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload?: SellerRegistrationApprovePayload;
    }) => _SellerRegistrationApi.approve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerRegistration', 'list'] });
    },
  });
};

export const useRejectSellerRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _SellerRegistrationApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerRegistration', 'list'] });
    },
  });
};

export const useDeleteSellerRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _SellerRegistrationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerRegistration', 'list'] });
    },
  });
};
