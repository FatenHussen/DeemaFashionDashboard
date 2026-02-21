import type {
  VendorData,
  VendorListResponse,
  VendorCreateUpdatePayload,
} from '../types/vendor.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _VendorApi = {
  getListVendor: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<VendorListResponse> => {
    const response = await axiosInstance.get<VendorListResponse>(apiRoutes.vendor.list, {
      params,
    });
    console.log(response);
    return response.data;
  },
  createVendor: async (data: VendorCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.vendor.create, data);
    return response.data;
  },
  updateVendor: async (id: number | string, data: VendorCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.vendor.update(id), data);
    return response.data;
  },
  deleteVendor: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.vendor.delete(id));
    return response.data;
  },
  getVendorById: async (id: number | string): Promise<VendorData> => {
    const response = await axiosInstance.get<VendorListResponse>(apiRoutes.vendor.list);
    // Find the vendor by ID from the list (or you might have a separate endpoint)
    const vendor = response.data.data.items.find((item) => item.id === Number(id));
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    return vendor;
  },
};
