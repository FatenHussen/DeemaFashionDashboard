import type { ScheduleListResponse, ScheduleCreatePayload, ScheduleDetailsResponse } from '../types/schedule.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ScheduleApi = {
  getList: async (params?: { page?: number; per_page?: number; is_active?: string; search?: string }): Promise<ScheduleListResponse> => {
    const response = await axiosInstance.get<ScheduleListResponse>(apiRoutes.schedule.list, { params });
    return response.data;
  },

  getById: async (id: number | string): Promise<ScheduleDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.schedule.details(id));
    return response.data;
  },

  create: async (data: ScheduleCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.schedule.create, data);
    return response.data;
  },

  update: async (id: number | string, data: Partial<ScheduleCreatePayload>): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.schedule.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.schedule.delete(id));
    return response.data;
  },
};
