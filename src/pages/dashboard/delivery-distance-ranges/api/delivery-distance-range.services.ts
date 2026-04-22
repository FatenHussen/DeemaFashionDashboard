import type {
  DeliveryDistanceRangePayload,
  DeliveryDistanceRangeListResponse,
  DeliveryDistanceRangeDetailsResponse,
} from '../types/delivery-distance-range.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _DeliveryDistanceRangeApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<DeliveryDistanceRangeListResponse> => {
    const response = await axiosInstance.get<DeliveryDistanceRangeListResponse>(
      apiRoutes.deliveryDistanceRange.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<DeliveryDistanceRangeDetailsResponse> => {
    const response = await axiosInstance.get<DeliveryDistanceRangeDetailsResponse>(
      apiRoutes.deliveryDistanceRange.details(id)
    );
    return response.data;
  },

  create: async (data: DeliveryDistanceRangePayload): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.deliveryDistanceRange.create, data);
    return response.data;
  },

  update: async (
    id: number | string,
    data: Partial<DeliveryDistanceRangePayload>
  ): Promise<unknown> => {
    const response = await axiosInstance.patch(apiRoutes.deliveryDistanceRange.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.deliveryDistanceRange.delete(id));
    return response.data;
  },
};
