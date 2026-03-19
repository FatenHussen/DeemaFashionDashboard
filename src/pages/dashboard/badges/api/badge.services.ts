import type { BadgeListResponse, BadgeCreatePayload, BadgeDetailsResponse } from '../types/badge.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _BadgeApi = {
  getListBadges: async (params?: { page?: number; per_page?: number; type?: string }): Promise<BadgeListResponse> => {
    const response = await axiosInstance.get<BadgeListResponse>(apiRoutes.badge.list, { params });
    return response.data;
  },

  getBadgeById: async (id: number | string): Promise<BadgeDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.badge.details(id));
    return response.data;
  },

  createBadge: async (data: BadgeCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.badge.create, data);
    return response.data;
  },

  updateBadge: async (id: number | string, data: Partial<BadgeCreatePayload>): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.badge.update(id), data);
    return response.data;
  },

  deleteBadge: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.badge.delete(id));
    return response.data;
  },
};
