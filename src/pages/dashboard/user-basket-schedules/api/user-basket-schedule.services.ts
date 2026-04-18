import type { UserBasketScheduleListResponse, UserBasketScheduleCreatePayload, UserBasketScheduleDetailsResponse } from '../types/user-basket-schedule.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _UserBasketScheduleApi = {
  getList: async (params?: { page?: number; per_page?: number; is_active?: string; search?: string }): Promise<UserBasketScheduleListResponse> => {
    const response = await axiosInstance.get<UserBasketScheduleListResponse>(apiRoutes.userBasketSchedule.list, { params });
    return response.data;
  },

  getById: async (id: number | string): Promise<UserBasketScheduleDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.userBasketSchedule.details(id));
    return response.data;
  },

  create: async (data: UserBasketScheduleCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.userBasketSchedule.create, data);
    return response.data;
  },

  update: async (id: number | string, data: Partial<UserBasketScheduleCreatePayload>): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.userBasketSchedule.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.userBasketSchedule.delete(id));
    return response.data;
  },

  disable: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.userBasketSchedule.disable(id));
    return response.data;
  },

  enable: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.userBasketSchedule.enable(id));
    return response.data;
  },
};
