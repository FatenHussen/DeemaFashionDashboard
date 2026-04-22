import type { BannerItem, BannerFormValues, BannerListResponse } from '../types/banner.types';

import { apiRoutes, axiosInstance } from '@/api';
import { toApiBilingualDescription } from '@/utils/optional-bilingual-api-placeholder';
import { couponLocalDateTimeToISO } from '@/pages/dashboard/coupons/validation/coupon.validation';

function appendExpiresAt(formData: FormData, expiresAt: string | undefined) {
  const v = expiresAt?.trim();
  if (!v) return;
  formData.append('expires_at', couponLocalDateTimeToISO(v));
}

export const _BannerApi = {
  getListBanners: async (
    params?: { page?: number; per_page?: number; search?: string }
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
    const { en: outEn, ar: outAr } = toApiBilingualDescription(
      data.description?.en ?? '',
      data.description?.ar ?? ''
    );
    formData.append('description[en]', outEn);
    formData.append('description[ar]', outAr);
    formData.append('link', data.link);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    appendExpiresAt(formData, data.expires_at);

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
    const { en: outEn, ar: outAr } = toApiBilingualDescription(
      data.description?.en ?? '',
      data.description?.ar ?? ''
    );
    formData.append('description[en]', outEn);
    formData.append('description[ar]', outAr);
    formData.append('link', data.link);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    appendExpiresAt(formData, data.expires_at);

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

  getBannerById: async (id: number | string): Promise<{ status: boolean; data: BannerItem }> => {
    const response = await axiosInstance.get(apiRoutes.banner.details(id));
    return response.data;
  },
};
