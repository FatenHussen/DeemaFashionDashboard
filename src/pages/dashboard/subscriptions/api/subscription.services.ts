import type {
  SubscriptionListResponse,
  SubscriptionDetailsResponse,
  SubscriptionListParams,
} from '../types/subscription.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _SubscriptionApi = {
  getListSubscriptions: async (
    params?: SubscriptionListParams
  ): Promise<SubscriptionListResponse> => {
    const response = await axiosInstance.get<SubscriptionListResponse>(apiRoutes.subscription.list, {
      params,
    });
    return response.data;
  },

  getSubscriptionById: async (id: number | string): Promise<SubscriptionDetailsResponse> => {
    const response = await axiosInstance.get<SubscriptionDetailsResponse>(
      apiRoutes.subscription.details(id)
    );
    return response.data;
  },
};
