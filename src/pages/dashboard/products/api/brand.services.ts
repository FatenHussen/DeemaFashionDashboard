import type {
  BrandListResponse,
  BrandDetailsResponse,
  BrandCreateUpdatePayload,
} from '../types/brand.types';

import { apiRoutes, axiosInstance } from '@/api';

export type BrandListQueryParams = {
  name?: string;
  page?: number;
  per_page?: number;
  is_active?: 0 | 1 | boolean;
  category_id?: number;
  origin_country_id?: number;
};

export const _BrandApi = {
  getListBrands: async (params?: BrandListQueryParams): Promise<BrandListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.name?.trim()) searchParams.set('name', params.name.trim());
    if (params?.category_id != null && params.category_id > 0)
      searchParams.set('category_id', String(params.category_id));
    if (params?.origin_country_id != null && params.origin_country_id > 0)
      searchParams.set('origin_country_id', String(params.origin_country_id));
    if (params?.is_active === true || params?.is_active === 1) searchParams.set('is_active', '1');
    else if (params?.is_active === false || params?.is_active === 0) searchParams.set('is_active', '0');

    const query = searchParams.toString();
    const url = query ? `${apiRoutes.brand.list}?${query}` : apiRoutes.brand.list;
    const response = await axiosInstance.get<BrandListResponse>(url);
    return response.data;
  },
  getBrandById: async (id: number | string): Promise<BrandDetailsResponse> => {
    const response = await axiosInstance.get<BrandDetailsResponse>(apiRoutes.brand.details(id));
    return response.data;
  },
  createBrand: async (data: BrandCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    if (data.category_id != null && data.category_id > 0) {
      formData.append('category_id', String(data.category_id));
    }
    if (data.governorate_id != null && data.governorate_id > 0) {
      formData.append('governorate_id', String(data.governorate_id));
    }
    if (data.city_id != null && data.city_id > 0) {
      formData.append('city_id', String(data.city_id));
    }

    const response = await axiosInstance.post(apiRoutes.brand.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateBrand: async (id: number | string, data: BrandCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    if (data.category_id != null && data.category_id > 0) {
      formData.append('category_id', String(data.category_id));
    }
    if (data.governorate_id != null && data.governorate_id > 0) {
      formData.append('governorate_id', String(data.governorate_id));
    }
    if (data.city_id != null && data.city_id > 0) {
      formData.append('city_id', String(data.city_id));
    }

    const response = await axiosInstance.patch(apiRoutes.brand.update(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteBrand: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.brand.delete(id));
    return response.data;
  },
};
