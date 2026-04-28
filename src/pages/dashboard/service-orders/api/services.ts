import type { ServiceOrderData, ServiceOrderStatus, ServiceOrderListResponse } from '../types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ServiceOrderApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    shop_id?: number;
    vendor_service_id?: number;
    user_id?: number;
    search?: string;
  }): Promise<ServiceOrderListResponse> => {
    const response = await axiosInstance.get<ServiceOrderListResponse>(
      apiRoutes.serviceOrder.list,
      { params }
    );
    return response.data;
  },

  getOne: async (id: number | string): Promise<{ status: boolean; data: ServiceOrderData }> => {
    const response = await axiosInstance.get(apiRoutes.serviceOrder.getOne(id));
    return response.data;
  },

  changeStatus: async (
    id: number | string,
    status: ServiceOrderStatus
  ): Promise<{ status: boolean; data: ServiceOrderData }> => {
    const response = await axiosInstance.patch(apiRoutes.serviceOrder.changeStatus(id), {
      status,
    });
    return response.data;
  },
};
