import type {
  CategoryAttributeListResponse,
  CategoryAttributeDetailResponse,
  CategoryAttributeCreateUpdatePayload,
} from '../types/category-attribute.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CategoryAttributeCreateUpdatePayload };

export const _CategoryAttributeApi = {
  getListCategoryAttributes: async (
    page: number = 1,
    limit: number = 25,
    categoryId?: number | string
  ): Promise<CategoryAttributeListResponse> => {
    const params: Record<string, string | number> = { page, per_page: limit };
    if (categoryId) params.category_id = categoryId;
    const response = await axiosInstance.get<CategoryAttributeListResponse>(
      apiRoutes.categoryAttribute.list,
      { params }
    );
    return response.data;
  },

  getCategoryAttributeById: async (
    id: number | string
  ): Promise<CategoryAttributeDetailResponse> => {
    const response = await axiosInstance.get<CategoryAttributeDetailResponse>(
      apiRoutes.categoryAttribute.details(id)
    );
    return response.data;
  },
  createCategoryAttribute: async (data: CategoryAttributeCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.categoryAttribute.create, data);
    return response.data;
  },
  updateCategoryAttribute: async (
    id: number | string,
    data: CategoryAttributeCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.categoryAttribute.update(id), data);
    return response.data;
  },
  deleteCategoryAttribute: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.categoryAttribute.delete(id));
    return response.data;
  },
};
