import type { SettingListResponse, SettingDetailsResponse } from '../types/setting.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _SettingApi = {
  getListSettings: async (params?: { page?: number; per_page?: number }): Promise<SettingListResponse> => {
    const response = await axiosInstance.get<SettingListResponse>(apiRoutes.setting.list, { params });
    return response.data;
  },

  getSettingByKey: async (key: string): Promise<SettingDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.setting.details(key));
    return response.data;
  },

  updateSetting: async (key: string, value: any, isFile?: boolean): Promise<any> => {
    if (isFile && value instanceof File) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('value', value);
      const response = await axiosInstance.post(apiRoutes.setting.update(key), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await axiosInstance.put(apiRoutes.setting.update(key), { value });
    return response.data;
  },
};
