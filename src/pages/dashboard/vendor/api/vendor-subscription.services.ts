import type {
  VendorSubscriptionCreatePayload,
  VendorSubscriptionFilters,
  VendorSubscriptionListResponse,
  VendorSubscriptionDetailsResponse,
} from '../types/vendor-subscription.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _VendorSubscriptionApi = {
  getList: async (
    params?: {
      page?: number;
      per_page?: number;
      sort_field?: string;
      sort_order?: string;
    } & VendorSubscriptionFilters
  ): Promise<VendorSubscriptionListResponse> => {
    const response = await axiosInstance.get<VendorSubscriptionListResponse>(
      apiRoutes.vendorSubscription.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<VendorSubscriptionDetailsResponse> => {
    const response = await axiosInstance.get<VendorSubscriptionDetailsResponse>(
      apiRoutes.vendorSubscription.details(id)
    );
    return response.data;
  },

  create: async (data: VendorSubscriptionCreatePayload): Promise<VendorSubscriptionDetailsResponse> => {
    const response = await axiosInstance.post<VendorSubscriptionDetailsResponse>(
      apiRoutes.vendorSubscription.create,
      data
    );
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(apiRoutes.vendorSubscription.delete(id));
  },
};
