import type {
  BrandListResponse,
  BrandDetailsResponse,
  BrandCreateUpdatePayload,
} from '../types/brand.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _BrandApi = {
  getListBrands: async (params?: { name?: string }): Promise<BrandListResponse> => {
    const response = await axiosInstance.get<BrandListResponse>(apiRoutes.brand.list, {
      params,
    });
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
