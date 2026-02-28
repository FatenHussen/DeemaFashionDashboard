import type {
  SellerRegistrationItem,
  SellerRegistrationListResponse,
  SellerRegistrationApprovePayload,
} from '../types/seller-registration.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _SellerRegistrationApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<SellerRegistrationListResponse> => {
    const response = await axiosInstance.get<SellerRegistrationListResponse>(
      apiRoutes.sellerRegistration.list,
      { params }
    );
    return response.data;
  },

  getById: async (
    id: number | string
  ): Promise<{ success: boolean; data: SellerRegistrationItem }> => {
    const response = await axiosInstance.get(apiRoutes.sellerRegistration.details(id));
    return response.data;
  },

  approve: async (
    id: number | string,
    payload?: SellerRegistrationApprovePayload
  ): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.sellerRegistration.approve(id), payload);
    return response.data;
  },

  reject: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.sellerRegistration.reject(id));
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.sellerRegistration.delete(id));
    return response.data;
  },
};
