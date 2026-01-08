import { axiosInstance, apiRoutes } from '@/api';
import type {
  GovernorateData,
  GovernorateListResponse,
  GovernorateCreateUpdatePayload,
} from '../types/governorate.types';

export type { GovernorateCreateUpdatePayload };

export const _GovernorateApi = {
  getListGovernorates: async (): Promise<GovernorateListResponse> => {
    const response = await axiosInstance.get<GovernorateListResponse>(apiRoutes.governorate.list);
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
    const response = await axiosInstance.get<GovernorateListResponse>(apiRoutes.governorate.list);
    // Find the governorate by ID from the list
    const governorate = response.data.data.items.find((item) => item.id === Number(id));
    if (!governorate) {
      throw new Error('Governorate not found');
    }
    return governorate;
  },
};
