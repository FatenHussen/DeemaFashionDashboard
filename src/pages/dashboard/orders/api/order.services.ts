import type {
  OrderListResponse,
  AssignDriverPayload,
  OrderDetailsResponse,
  ChangeItemStatusPayload,
  ChangeOrderStatusPayload,
} from '../types/order.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _OrderApi = {
  getListOrders: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<OrderListResponse> => {
    const response = await axiosInstance.get<OrderListResponse>(apiRoutes.order.list, {
      params,
    });
    return response.data;
  },

  getOrderById: async (id: number | string): Promise<OrderDetailsResponse> => {
    const response = await axiosInstance.get<OrderDetailsResponse>(apiRoutes.order.getOne(id));
    return response.data;
  },

  changeOrderStatus: async (
    id: number | string,
    data: ChangeOrderStatusPayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.order.changeStatus(id), data);
    return response.data;
  },

  assignDriver: async (
    id: number | string,
    data: AssignDriverPayload
  ): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.order.assignDriver(id), data);
    return response.data;
  },

  changeItemStatus: async (
    itemId: number | string,
    data: ChangeItemStatusPayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.order.changeItemStatus(itemId), data);
    return response.data;
  },
};
