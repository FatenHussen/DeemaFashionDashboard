import type {
  VendorServiceData,
  VendorServicePayload,
  VendorServiceListResponse,
} from '../types';

import { apiRoutes, axiosInstance } from '@/api';

export const _VendorServiceApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<VendorServiceListResponse> => {
    const response = await axiosInstance.get<VendorServiceListResponse>(
      apiRoutes.vendorService.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<{ status: boolean; data: VendorServiceData }> => {
    const response = await axiosInstance.get(apiRoutes.vendorService.details(id));
    return response.data;
  },

  create: async (data: VendorServicePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.vendorService.create, data);
    return response.data;
  },

  update: async (id: number | string, data: Partial<VendorServicePayload>): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.vendorService.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.vendorService.delete(id));
    return response.data;
  },
};
