import type {
  LanguageData,
  LanguageListParams,
  LanguageListResponse,
  LanguageDetailsResponse,
  LanguageCreateUpdatePayload,
} from '../types/language.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _LanguageApi = {
  getListLanguage: async (params?: LanguageListParams): Promise<LanguageListResponse> => {
    const response = await axiosInstance.get<LanguageListResponse>(apiRoutes.language.list, {
      params,
    });
    return response.data;
  },
  createLanguage: async (data: LanguageCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('code', data.code);
    formData.append('native_name', data.native_name);
    formData.append('direction', data.direction);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('is_default', data.is_default ? '1' : '0');

    if (data.flag_icon instanceof File) {
      formData.append('flag_icon', data.flag_icon);
    }

    const response = await axiosInstance.post(apiRoutes.language.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateLanguage: async (
    id: number | string,
    data: LanguageCreateUpdatePayload
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('code', data.code);
    formData.append('native_name', data.native_name);
    formData.append('direction', data.direction);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('is_default', data.is_default ? '1' : '0');

    if (data.flag_icon instanceof File) {
      formData.append('flag_icon', data.flag_icon);
    }

    formData.append('_method', 'PUT');

    const response = await axiosInstance.post(apiRoutes.language.update(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteLanguage: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.language.delete(id));
    return response.data;
  },
  getLanguageById: async (id: number | string): Promise<LanguageData> => {
    const response = await axiosInstance.get<LanguageDetailsResponse>(
      apiRoutes.language.details(id)
    );
    return response.data.data;
  },
};
