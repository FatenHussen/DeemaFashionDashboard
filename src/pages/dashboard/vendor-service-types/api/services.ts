import type {
  VendorServiceTypeData,
  VendorServiceTypePayload,
  VendorServiceTypeListResponse,
} from '../types';

import { apiRoutes, axiosInstance } from '@/api';

export const _VendorServiceTypeApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<VendorServiceTypeListResponse> => {
    const response = await axiosInstance.get<VendorServiceTypeListResponse>(
      apiRoutes.vendorServiceType.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<{ status: boolean; data: VendorServiceTypeData }> => {
    const response = await axiosInstance.get(apiRoutes.vendorServiceType.details(id));
    return response.data;
  },

  create: async (data: VendorServiceTypePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.vendorServiceType.create, data);
    return response.data;
  },

  update: async (id: number | string, data: Partial<VendorServiceTypePayload>): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.vendorServiceType.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.vendorServiceType.delete(id));
    return response.data;
  },
};
