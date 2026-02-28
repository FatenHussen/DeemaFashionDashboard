import type {
  PackageListResponse,
  PackageDetailsResponse,
  PackageCreateUpdatePayload,
} from '../types/package.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _PackageApi = {
  getListPackages: async (
    params?: { page?: number; per_page?: number }
  ): Promise<PackageListResponse> => {
    const response = await axiosInstance.get<PackageListResponse>(apiRoutes.package.list, {
      params,
    });
    return response.data;
  },

  getPackageById: async (id: number | string): Promise<PackageDetailsResponse> => {
    const response = await axiosInstance.get<PackageDetailsResponse>(apiRoutes.package.details(id));
    return response.data;
  },

  createPackage: async (data: PackageCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.package.create, data);
    return response.data;
  },

  updatePackage: async (
    id: number | string,
    data: PackageCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.package.update(id), data);
    return response.data;
  },

  deletePackage: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.package.delete(id));
    return response.data;
  },
};
