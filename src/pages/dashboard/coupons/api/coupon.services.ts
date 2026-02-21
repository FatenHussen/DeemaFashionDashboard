import type {
  CouponListResponse,
  CouponDetailsResponse,
  CouponCreateUpdatePayload,
} from '../types/coupon.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _CouponApi = {
  getListCoupons: async (
    params?: { page?: number; per_page?: number }
  ): Promise<CouponListResponse> => {
    const response = await axiosInstance.get<CouponListResponse>(apiRoutes.coupon.list, {
      params,
    });
    return response.data;
  },

  getCouponById: async (id: number | string): Promise<CouponDetailsResponse> => {
    const response = await axiosInstance.get<CouponDetailsResponse>(apiRoutes.coupon.details(id));
    return response.data;
  },

  createCoupon: async (data: CouponCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.coupon.create, data);
    return response.data;
  },

  updateCoupon: async (
    id: number | string,
    data: CouponCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.coupon.update(id), data);
    return response.data;
  },

  deleteCoupon: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.coupon.delete(id));
    return response.data;
  },
};
