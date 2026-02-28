import type {
  SubscriptionListResponse,
  SubscriptionDetailsResponse,
  SubscriptionCreateUpdatePayload,
} from '../types/subscription.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _SubscriptionApi = {
  getListSubscriptions: async (
    params?: { page?: number; per_page?: number }
  ): Promise<SubscriptionListResponse> => {
    const response = await axiosInstance.get<SubscriptionListResponse>(apiRoutes.subscription.list, {
      params,
    });
    return response.data;
  },

  getSubscriptionById: async (id: number | string): Promise<SubscriptionDetailsResponse> => {
    const response = await axiosInstance.get<SubscriptionDetailsResponse>(apiRoutes.subscription.details(id));
    return response.data;
  },

  createSubscription: async (data: SubscriptionCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.subscription.create, data);
    return response.data;
  },

  updateSubscription: async (
    id: number | string,
    data: SubscriptionCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.subscription.update(id), data);
    return response.data;
  },

  deleteSubscription: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.subscription.delete(id));
    return response.data;
  },
};
