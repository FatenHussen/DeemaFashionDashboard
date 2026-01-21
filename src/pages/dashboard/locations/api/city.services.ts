import type { CityData, CityListResponse, CityCreateUpdatePayload } from '../types/city.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CityCreateUpdatePayload };

export const _CityApi = {
  getListCities: async (): Promise<CityListResponse> => {
    const response = await axiosInstance.get<CityListResponse>(apiRoutes.city.list);
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
    const response = await axiosInstance.get<CityListResponse>(apiRoutes.city.list);
    // Find the city by ID from the list
    const city = response.data.data.items.find((item) => item.id === Number(id));
    if (!city) {
      throw new Error('City not found');
    }
    return city;
  },
};
