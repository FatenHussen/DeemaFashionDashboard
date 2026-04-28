import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

export type NotificationApiItem = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationListResponse = {
  status: boolean;
  message: string;
  data: NotificationApiItem[];
};

export const _NotificationApi = {
  getList: async (): Promise<NotificationListResponse> => {
    const response = await axiosInstance.get<NotificationListResponse>(
      apiRoutes.auth.notifications
    );
    return response.data;
  },
};
