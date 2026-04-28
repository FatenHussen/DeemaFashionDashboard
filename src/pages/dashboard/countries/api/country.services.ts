import type { CountryListResponse, CountryCreatePayload, CountryDetailsResponse } from '../types/country.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _CountryApi = {
  getListCountries: async (params?: { page?: number; per_page?: number; is_active?: string; search?: string }): Promise<CountryListResponse> => {
    const response = await axiosInstance.get<CountryListResponse>(apiRoutes.country.list, { params });
    return response.data;
  },

  getCountryById: async (id: number | string): Promise<CountryDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.country.details(id));
    return response.data;
  },

  createCountry: async (data: CountryCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.country.create, data);
    return response.data;
  },

  updateCountry: async (id: number | string, data: Partial<CountryCreatePayload>): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.country.update(id), data);
    return response.data;
  },

  deleteCountry: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.country.delete(id));
    return response.data;
  },
};
