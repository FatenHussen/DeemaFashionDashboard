import type {
  ShopVendorServiceData,
  ShopVendorServiceListResponse,
  ShopVendorServiceCreatePayload,
  ShopVendorServiceUpdatePayload,
} from '../types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ShopVendorServiceApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<ShopVendorServiceListResponse> => {
    const response = await axiosInstance.get<ShopVendorServiceListResponse>(
      apiRoutes.shopVendorService.list,
      { params }
    );
    return response.data;
  },

  getById: async (
    id: number | string
  ): Promise<{ status: boolean; data: ShopVendorServiceData }> => {
    const response = await axiosInstance.get(apiRoutes.shopVendorService.details(id));
    return response.data;
  },

  create: async (data: ShopVendorServiceCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.shopVendorService.create, data);
    return response.data;
  },

  update: async (id: number | string, data: ShopVendorServiceUpdatePayload): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.shopVendorService.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.shopVendorService.delete(id));
    return response.data;
  },
};
