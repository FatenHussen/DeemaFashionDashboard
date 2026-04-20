import type {
  CategoryDetailListResponse,
  CategoryDetailDetailResponse,
  CategoryDetailCreateUpdatePayload,
} from '../types/category-detail.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CategoryDetailCreateUpdatePayload };

export const _CategoryDetailApi = {
  getListCategoryDetails: async (
    page: number = 1,
    perPage: number = 25,
    params?: { search?: string }
  ): Promise<CategoryDetailListResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('per_page', String(perPage));
    if (params?.search?.trim()) searchParams.set('search', params.search.trim());
    const response = await axiosInstance.get<CategoryDetailListResponse>(
      `${apiRoutes.categoryDetail.list}?${searchParams.toString()}`
    );
    return response.data;
  },
  getCategoryDetailById: async (
    id: number | string
  ): Promise<CategoryDetailDetailResponse> => {
    const response = await axiosInstance.get<CategoryDetailDetailResponse>(
      apiRoutes.categoryDetail.details(id)
    );
    return response.data;
  },
  createCategoryDetail: async (data: CategoryDetailCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.categoryDetail.create, data);
    return response.data;
  },
  updateCategoryDetail: async (
    id: number | string,
    data: CategoryDetailCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.categoryDetail.update(id), data);
    return response.data;
  },
  deleteCategoryDetail: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.categoryDetail.delete(id));
    return response.data;
  },
};
