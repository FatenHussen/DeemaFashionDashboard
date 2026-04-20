import type {
  GovernorateData,
  GovernorateListResponse,
  GovernorateCreateUpdatePayload,
} from '../types/governorate.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { GovernorateCreateUpdatePayload };

export const _GovernorateApi = {
  getListGovernorates: async (
    params?: { page?: number; per_page?: number; search?: string }
  ): Promise<GovernorateListResponse> => {
    const response = await axiosInstance.get<GovernorateListResponse>(apiRoutes.governorate.list, {
      params,
    });
    return response.data;
  },
  createGovernorate: async (data: GovernorateCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.governorate.create, data);
    return response.data;
  },
  updateGovernorate: async (
    id: number | string,
    data: GovernorateCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.governorate.update(id), data);
    return response.data;
  },
  deleteGovernorate: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.governorate.delete(id));
    return response.data;
  },
  getGovernorateById: async (id: number | string): Promise<GovernorateData> => {
    const response = await axiosInstance.get(apiRoutes.governorate.details(id));
    return response.data?.data ?? response.data;
  },
};
