import type {
  NotificationType,
  NotificationListResponse,
  NotificationCreatePayload,
  NotificationDetailsResponse,
} from '../types/notification.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _AdminNotificationApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: NotificationType | 'all';
  }): Promise<NotificationListResponse> => {
    const { type, ...rest } = params ?? {};
    const response = await axiosInstance.get<NotificationListResponse>(
      apiRoutes.adminNotification.list,
      { params: { ...rest, ...(type && type !== 'all' ? { type } : {}) } }
    );
    return response.data;
  },

  create: async (data: NotificationCreatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('body', data.body);
    formData.append('type', data.type);
    data.channels.forEach((ch, i) => formData.append(`channels[${i}]`, ch));
    if (data.target_page) formData.append('target_page', data.target_page);
    if (data.emoji) formData.append('emoji', data.emoji);
    if (data.media instanceof File) formData.append('media', data.media);

    const response = await axiosInstance.post(apiRoutes.adminNotification.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getById: async (id: number | string): Promise<NotificationDetailsResponse> => {
    const response = await axiosInstance.get<NotificationDetailsResponse>(
      apiRoutes.adminNotification.details(id)
    );
    return response.data;
  },
};
