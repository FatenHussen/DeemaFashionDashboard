import type { CurrencyListResponse, CurrencyDetailsResponse, CurrencyCreateUpdatePayload } from '../types/currency.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _CurrencyApi = {
  getListCurrencies: async (params?: { page?: number; per_page?: number }): Promise<CurrencyListResponse> => {
    const response = await axiosInstance.get<CurrencyListResponse>(apiRoutes.currency.list, { params });
    return response.data;
  },

  getCurrencyById: async (id: number | string): Promise<CurrencyDetailsResponse> => {
    const response = await axiosInstance.get<CurrencyDetailsResponse>(apiRoutes.currency.details(id));
    return response.data;
  },

  createCurrency: async (data: CurrencyCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.currency.create, data);
    return response.data;
  },

  updateCurrency: async (id: number | string, data: CurrencyCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.currency.update(id), data);
    return response.data;
  },

  deleteCurrency: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.currency.delete(id));
    return response.data;
  },

  toggleStatus: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.currency.toggleStatus(id));
    return response.data;
  },
};
