import type { ActivityLogListResponse } from '../types/activity-log.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ActivityLogApi = {
  getListActivityLogs: async (params?: {
    page?: number;
    per_page?: number;
    action?: string;
    model?: string;
  }): Promise<ActivityLogListResponse> => {
    const response = await axiosInstance.get<ActivityLogListResponse>(apiRoutes.activityLog.list, { params });
    return response.data;
  },
};
