import type { ActivityLogListResponse } from '../types/activity-log.types';

import { apiRoutes, axiosInstance } from '@/api';

function normalizeActivityLogListPayload(body: unknown): ActivityLogListResponse {
  const root = body as Record<string, unknown> | null | undefined;
  if (!root || typeof root !== 'object') {
    return {
      items: [],
      pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    };
  }
  // Laravel-style: { status, data: { items, pagination } }
  const nested =
    root.data != null && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null;
  const src = nested && Array.isArray(nested.items) ? nested : root;
  const items = Array.isArray(src.items) ? src.items : [];
  const p = src.pagination as ActivityLogListResponse['pagination'] | undefined;
  return {
    items,
    pagination: p ?? { current_page: 1, last_page: 1, per_page: 10, total: 0 },
  };
}

export const _ActivityLogApi = {
  getListActivityLogs: async (params?: {
    page?: number;
    per_page?: number;
    action?: string;
    model?: string;
  }): Promise<ActivityLogListResponse> => {
    const response = await axiosInstance.get(apiRoutes.activityLog.list, { params });
    return normalizeActivityLogListPayload(response.data);
  },
};
