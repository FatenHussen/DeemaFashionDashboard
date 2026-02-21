import type { BannerListResponse, BannerFormValues } from '../types/banner.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _BannerApi = {
  getListBanners: async (
    params?: { page?: number; per_page?: number }
  ): Promise<BannerListResponse> => {
    const response = await axiosInstance.get<BannerListResponse>(apiRoutes.banner.list, {
      params,
    });
    return response.data;
  },

  createBanner: async (data: BannerFormValues): Promise<any> => {
    const formData = new FormData();
    formData.append('title[en]', data.title.en);
    formData.append('title[ar]', data.title.ar);
    formData.append('description', data.description);
    formData.append('link', data.link);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    const response = await axiosInstance.post(apiRoutes.banner.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateBanner: async (id: number | string, data: BannerFormValues): Promise<any> => {
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    formData.append('title[en]', data.title.en);
    formData.append('title[ar]', data.title.ar);
    formData.append('description[en]', data.description);
    formData.append('link', data.link);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    const response = await axiosInstance.post(apiRoutes.banner.update(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBanner: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.banner.delete(id));
    return response.data;
  },
};
