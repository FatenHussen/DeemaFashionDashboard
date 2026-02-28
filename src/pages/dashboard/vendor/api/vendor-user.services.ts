import type {
  VendorUserItem,
  VendorUserListResponse,
  VendorUserCreatePayload,
  VendorUserUpdatePayload,
} from '../types/vendor-user.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _VendorUserApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<VendorUserListResponse> => {
    const response = await axiosInstance.get<VendorUserListResponse>(apiRoutes.vendorUser.list, {
      params,
    });
    return response.data;
  },

  getById: async (id: number | string): Promise<{ status: boolean; data: VendorUserItem }> => {
    const response = await axiosInstance.get(apiRoutes.vendorUser.details(id));
    return response.data;
  },

  create: async (data: VendorUserCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.vendorUser.create, data);
    return response.data;
  },

  update: async (id: number | string, data: VendorUserUpdatePayload): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.vendorUser.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.vendorUser.delete(id));
    return response.data;
  },

  getShopsByVendor: async (vendorId: number | string): Promise<any> => {
    const response = await axiosInstance.get(apiRoutes.shop.list, {
      params: { vendor_id: vendorId, per_page: 1000 },
    });
    return response.data;
  },
};
