import type {
  VendorPackageListResponse,
  VendorPackageDetailsResponse,
  VendorPackageCreateUpdatePayload,
} from '../types/vendor-package.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _VendorPackageApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    sort_field?: string;
    sort_order?: string;
    is_active?: number;
    min_price?: number;
    max_price?: number;
    slug?: string;
    search?: string;
  }): Promise<VendorPackageListResponse> => {
    const response = await axiosInstance.get<VendorPackageListResponse>(
      apiRoutes.vendorPackage.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<VendorPackageDetailsResponse> => {
    const response = await axiosInstance.get<VendorPackageDetailsResponse>(
      apiRoutes.vendorPackage.details(id)
    );
    return response.data;
  },

  create: async (data: VendorPackageCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.vendorPackage.create, data);
    return response.data;
  },

  update: async (
    id: number | string,
    data: VendorPackageCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.vendorPackage.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(apiRoutes.vendorPackage.delete(id));
  },
};
