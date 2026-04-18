import type { IconListResponse, IconCreatePayload, IconDetailsResponse } from '../types/icon.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _IconApi = {
  getListIcons: async (params?: { page?: number; per_page?: number }): Promise<IconListResponse> => {
    const response = await axiosInstance.get<IconListResponse>(apiRoutes.icon.list, { params });
    return response.data;
  },

  getIconById: async (id: number | string): Promise<IconDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.icon.details(id));
    return response.data;
  },

  createIcon: async (data: IconCreatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    if (data.image instanceof File) formData.append('image', data.image);
    if (data.description?.en) formData.append('description[en]', data.description.en);
    if (data.description?.ar) formData.append('description[ar]', data.description.ar);
    formData.append('full_description[en]', data.full_description?.en ?? '');
    formData.append('full_description[ar]', data.full_description?.ar ?? '');
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
    const response = await axiosInstance.post(apiRoutes.icon.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateIcon: async (id: number | string, data: Partial<IconCreatePayload>): Promise<any> => {
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    if (data.name?.en) formData.append('name[en]', data.name.en);
    if (data.name?.ar) formData.append('name[ar]', data.name.ar);
    if (data.image instanceof File) formData.append('image', data.image);
    if (data.description?.en) formData.append('description[en]', data.description.en);
    if (data.description?.ar) formData.append('description[ar]', data.description.ar);
    formData.append('full_description[en]', data.full_description?.en ?? '');
    formData.append('full_description[ar]', data.full_description?.ar ?? '');
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
    const response = await axiosInstance.post(apiRoutes.icon.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteIcon: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.icon.delete(id));
    return response.data;
  },
};
