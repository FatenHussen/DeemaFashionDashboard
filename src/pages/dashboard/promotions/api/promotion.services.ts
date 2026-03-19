import type {
  PromotionListResponse,
  PromotionCreatePayload,
  PromotionUpdatePayload,
  PromotionDetailsResponse,
} from '../types/promotion.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _PromotionApi = {
  getListPromotions: async (params?: { page?: number; per_page?: number }): Promise<PromotionListResponse> => {
    const response = await axiosInstance.get<PromotionListResponse>(apiRoutes.promotion.list, { params });
    return response.data;
  },

  getPromotionById: async (id: number | string): Promise<PromotionDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.promotion.details(id));
    return response.data;
  },

  createPromotion: async (data: PromotionCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.promotion.create, data);
    return response.data;
  },

  updatePromotion: async (id: number | string, data: PromotionUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.promotion.update(id), data);
    return response.data;
  },

  deletePromotion: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.promotion.delete(id));
    return response.data;
  },
};
