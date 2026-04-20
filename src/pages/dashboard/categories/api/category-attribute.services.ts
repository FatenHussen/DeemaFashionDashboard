import type {
  CategoryAttributeListResponse,
  CategoryAttributeDetailResponse,
  CategoryAttributeCreateUpdatePayload,
} from '../types/category-attribute.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CategoryAttributeCreateUpdatePayload };

export type CategoryAttributeListParams = {
  page?: number;
  per_page?: number;
  category_id?: number | string;
  name?: string;
  search?: string;
  type?: string;
  is_active?: 0 | 1 | boolean;
};

function appendIf(
  target: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined | null
) {
  if (value === undefined || value === null || value === '') return;
  if (typeof value === 'boolean') {
    target.set(key, value ? '1' : '0');
    return;
  }
  target.set(key, String(value));
}

export const _CategoryAttributeApi = {
  getListCategoryAttributes: async (
    params: CategoryAttributeListParams = {}
  ): Promise<CategoryAttributeListResponse> => {
    const { page = 1, per_page = 25, category_id, name, search, type, is_active } = params;
    const searchParams = new URLSearchParams();
    appendIf(searchParams, 'page', page);
    appendIf(searchParams, 'per_page', per_page);
    if (
      category_id != null &&
      category_id !== '' &&
      !(typeof category_id === 'number' && category_id === 0) &&
      !(typeof category_id === 'string' && category_id === '0')
    ) {
      appendIf(searchParams, 'category_id', category_id);
    }
    if (name?.trim()) searchParams.set('name', name.trim());
    if (search?.trim()) searchParams.set('search', search.trim());
    appendIf(searchParams, 'type', type);
    if (is_active === true || is_active === 1) searchParams.set('is_active', '1');
    else if (is_active === false || is_active === 0) searchParams.set('is_active', '0');

    const query = searchParams.toString();
    const url = query
      ? `${apiRoutes.categoryAttribute.list}?${query}`
      : apiRoutes.categoryAttribute.list;
    const response = await axiosInstance.get<CategoryAttributeListResponse>(url);
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
