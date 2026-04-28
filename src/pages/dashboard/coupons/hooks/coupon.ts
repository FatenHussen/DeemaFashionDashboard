import type { CouponCreateUpdatePayload } from '../types/coupon.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _CouponApi } from '../api/coupon.services';

export const useFetchCoupons = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.coupon.list({ page, per_page: perPage, ...params }),
    queryFn: () => _CouponApi.getListCoupons({ page, per_page: perPage, ...params }),
  });

export const useFetchCouponById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.coupon.details(id),
    queryFn: () => _CouponApi.getCouponById(id),
    enabled: !!id,
  });

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CouponCreateUpdatePayload) => _CouponApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon', 'list'] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: CouponCreateUpdatePayload }) =>
      _CouponApi.updateCoupon(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupon', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.coupon.details(variables.id) });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _CouponApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon', 'list'] });
    },
  });
};
