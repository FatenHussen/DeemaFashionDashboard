import type {
  NotificationListResponse,
  NotificationCreatePayload,
} from '../types/notification.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _AdminNotificationApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<NotificationListResponse> => {
    const response = await axiosInstance.get<NotificationListResponse>(
      apiRoutes.adminNotification.list,
      { params }
    );
    return response.data;
  },

  create: async (data: NotificationCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(
      apiRoutes.adminNotification.create,
      data
    );
    return response.data;
  },
};
