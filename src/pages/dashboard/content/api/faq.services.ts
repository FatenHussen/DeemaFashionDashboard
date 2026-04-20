import type {
  FaqPayload,
  FaqListResponse,
  FaqDetailsResponse,
} from '../types/faq.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _FaqApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    type?: string;
    search?: string;
  }): Promise<FaqListResponse> => {
    const response = await axiosInstance.get<FaqListResponse>(apiRoutes.faq.list, { params });
    return response.data;
  },

  getById: async (id: number | string): Promise<FaqDetailsResponse> => {
    const response = await axiosInstance.get<FaqDetailsResponse>(apiRoutes.faq.details(id));
    return response.data;
  },

  create: async (data: FaqPayload): Promise<FaqDetailsResponse> => {
    const response = await axiosInstance.post<FaqDetailsResponse>(apiRoutes.faq.create, data);
    return response.data;
  },

  update: async (id: number | string, data: FaqPayload): Promise<FaqDetailsResponse> => {
    const response = await axiosInstance.patch<FaqDetailsResponse>(apiRoutes.faq.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(apiRoutes.faq.delete(id));
  },
};
