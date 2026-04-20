import type {
  PointExchangeListResponse,
  PointExchangeDetailsResponse,
  PointExchangeUpdateStatusPayload,
} from '../types/point-exchange.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _PointExchangeApi = {
  getListPointExchanges: async (
    params?: { page?: number; per_page?: number; search?: string }
  ): Promise<PointExchangeListResponse> => {
    const response = await axiosInstance.get<PointExchangeListResponse>(apiRoutes.pointExchange.list, {
      params,
    });
    return response.data;
  },

  getPointExchangeById: async (id: number | string): Promise<PointExchangeDetailsResponse> => {
    const response = await axiosInstance.get<PointExchangeDetailsResponse>(apiRoutes.pointExchange.details(id));
    return response.data;
  },

  updatePointExchangeStatus: async (
    id: number | string,
    data: PointExchangeUpdateStatusPayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.pointExchange.updateStatus(id), data);
    return response.data;
  },
};
