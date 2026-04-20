import type { CityData, CityListResponse, CityCreateUpdatePayload } from '../types/city.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CityCreateUpdatePayload };

export const _CityApi = {
  getListCities: async (params?: { page?: number; per_page?: number; search?: string }): Promise<CityListResponse> => {
    const response = await axiosInstance.get<CityListResponse>(apiRoutes.city.list, { params });
    return response.data;
  },
  createCity: async (data: CityCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.city.create, data);
    return response.data;
  },
  updateCity: async (id: number | string, data: CityCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.city.update(id), data);
    return response.data;
  },
  deleteCity: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.city.delete(id));
    return response.data;
  },
  getCityById: async (id: number | string): Promise<CityData> => {
    const response = await axiosInstance.get<{ status: boolean; message: string; data: CityData }>(
      apiRoutes.city.details(id)
    );
    return response.data.data;
  },
};
