import type { PointRuleListResponse, PointRuleCreatePayload, PointRuleDetailsResponse } from '../types/point-rule.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _PointRuleApi = {
  getList: async (params?: { page?: number; per_page?: number; is_active?: string; search?: string }): Promise<PointRuleListResponse> => {
    const response = await axiosInstance.get<PointRuleListResponse>(apiRoutes.pointRule.list, { params });
    return response.data;
  },

  getById: async (id: number | string): Promise<PointRuleDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.pointRule.details(id));
    return response.data;
  },

  create: async (data: PointRuleCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.pointRule.create, data);
    return response.data;
  },

  update: async (id: number | string, data: Partial<PointRuleCreatePayload>): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.pointRule.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.pointRule.delete(id));
    return response.data;
  },
};
