import type { PromotionRequestListResponse, PromotionRequestDetailsResponse } from '../types/promotion-request.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _PromotionRequestApi = {
  getList: async (params?: { page?: number; per_page?: number; status?: string; search?: string }): Promise<PromotionRequestListResponse> => {
    const response = await axiosInstance.get<PromotionRequestListResponse>(apiRoutes.promotionRequest.list, { params });
    return response.data;
  },

  getById: async (id: number | string): Promise<PromotionRequestDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.promotionRequest.details(id));
    return response.data;
  },

  approve: async (id: number | string, note?: string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.promotionRequest.approve(id), { note });
    return response.data;
  },

  reject: async (id: number | string, note?: string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.promotionRequest.reject(id), { note });
    return response.data;
  },
};
