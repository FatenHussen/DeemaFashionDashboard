import type {
  NotificationListResponse,
  NotificationCreatePayload,
  NotificationUpdatePayload,
  NotificationDetailsResponse,
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

  getById: async (id: number | string): Promise<NotificationDetailsResponse> => {
    const response = await axiosInstance.get<NotificationDetailsResponse>(
      apiRoutes.adminNotification.details(id)
    );
    return response.data;
  },

  update: async (id: number | string, data: NotificationUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(
      apiRoutes.adminNotification.update(id),
      data
    );
    return response.data;
  },
};
