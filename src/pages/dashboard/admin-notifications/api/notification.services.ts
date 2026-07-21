import type {
  NotificationType,
  NotificationListResponse,
  NotificationCreatePayload,
  NotificationDetailsResponse,
} from '../types/notification.types';

import { apiRoutes, axiosInstance } from '@/api';

function appendIdArray(
  formData: FormData,
  param: 'types' | 'driver_ids' | 'user_ids' | 'vendor_ids',
  values: number[] | string[]
) {
  values.forEach((v, i) => {
    formData.append(`${param}[${i}]`, String(v));
  });
}

export const _AdminNotificationApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: NotificationType | 'all';
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<NotificationListResponse> => {
    const { type, ...rest } = params ?? {};
    const response = await axiosInstance.get<NotificationListResponse>(
      apiRoutes.adminNotification.list,
      { params: { ...rest, ...(type && type !== 'all' ? { type } : {}) } }
    );
    return response.data;
  },

  create: async (data: NotificationCreatePayload): Promise<any> => {
    const {
      title,
      body,
      types,
      channels,
      emoji,
      media,
      driver_ids,
      user_ids,
      vendor_ids,
    } = data;
    const isAll = types.includes('all');
    const useMultipart = media instanceof File;

    if (!useMultipart) {
      const json: Record<string, unknown> = {
        title,
        body,
        channels: [...channels],
      };
      if (emoji) json.emoji = emoji;
      if (isAll) {
        json.type = 'all';
      } else if (types.length === 1) {
        json.type = types[0];
      } else {
        json.types = [...types];
      }
      if (!isAll) {
        if (types.includes('driver') && driver_ids?.length) json.driver_ids = driver_ids;
        if (types.includes('user') && user_ids?.length) json.user_ids = user_ids;
        if (types.includes('vendor') && vendor_ids?.length) json.vendor_ids = vendor_ids;
      }
      const response = await axiosInstance.post(apiRoutes.adminNotification.create, json, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    channels.forEach((ch, i) => formData.append(`channels[${i}]`, ch));
    if (emoji) formData.append('emoji', emoji);
    if (useMultipart) formData.append('media', media);

    if (isAll) {
      formData.append('type', 'all');
    } else if (types.length === 1) {
      formData.append('type', types[0]!);
    } else {
      appendIdArray(formData, 'types', types);
    }

    if (!isAll) {
      if (types.includes('driver') && driver_ids?.length) {
        appendIdArray(formData, 'driver_ids', driver_ids);
      }
      if (types.includes('user') && user_ids?.length) {
        appendIdArray(formData, 'user_ids', user_ids);
      }
      if (types.includes('vendor') && vendor_ids?.length) {
        appendIdArray(formData, 'vendor_ids', vendor_ids);
      }
    }

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
