import type {
  CategoryListResponse,
  CategoryDetailResponse,
  CategoryCreateUpdatePayload,
} from '../types/category.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CategoryCreateUpdatePayload };

export const _CategoryApi = {
  getListCategories: async (parentId?: number): Promise<CategoryListResponse> => {
    const url = parentId
      ? `${apiRoutes.category.list}?parent_id=${parentId}`
      : apiRoutes.category.list;
    const response = await axiosInstance.get<CategoryListResponse>(url);
    return response.data;
  },
  getListCategoriesPaginated: async (params?: {
    page?: number;
    per_page?: number;
    parent_id?: number;
    /** List direct children of this category (API query param). */
    category_id?: number;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    /** Admin list filter (preferred over `search` when both are used). */
    name?: string;
    is_active?: 0 | 1 | boolean;
    is_restaurant?: 0 | 1 | boolean;
  }): Promise<CategoryListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.parent_id != null) searchParams.set('parent_id', String(params.parent_id));
    if (params?.category_id != null) searchParams.set('category_id', String(params.category_id));
    if (params?.sort_field) searchParams.set('sort_field', params.sort_field);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
    if (params?.name?.trim()) searchParams.set('name', params.name.trim());
    else if (params?.search?.trim()) searchParams.set('search', params.search.trim());
    if (params?.is_active === true || params?.is_active === 1) searchParams.set('is_active', '1');
    else if (params?.is_active === false || params?.is_active === 0) searchParams.set('is_active', '0');
    if (params?.is_restaurant === true || params?.is_restaurant === 1)
      searchParams.set('is_restaurant', '1');
    else if (params?.is_restaurant === false || params?.is_restaurant === 0)
      searchParams.set('is_restaurant', '0');
    const query = searchParams.toString();
    const url = query ? `${apiRoutes.category.list}?${query}` : apiRoutes.category.list;
    const response = await axiosInstance.get<CategoryListResponse>(url);
    return response.data;
  },
  getCategoryById: async (id: number | string): Promise<CategoryDetailResponse> => {
    const response = await axiosInstance.get<CategoryDetailResponse>(
      apiRoutes.category.details(id)
    );
    return response.data;
  },
  createCategory: async (data: CategoryCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();

    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);

    if (data.icon) {
      formData.append('icon', data.icon);
    }

    if (data.parent_id) {
      formData.append('parent_id', data.parent_id.toString());
    }

    if (data.order !== undefined && data.order !== null) {
      formData.append('order', data.order.toString());
    }

    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('is_restaurant', data.is_restaurant ? '1' : '0');

    const response = await axiosInstance.post(apiRoutes.category.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateCategory: async (
    id: number | string,
    data: CategoryCreateUpdatePayload
  ): Promise<any> => {
    const formData = new FormData();

    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);

    if (data.icon) {
      formData.append('icon', data.icon);
    }

    if (data.parent_id) {
      formData.append('parent_id', data.parent_id.toString());
    }

    if (data.order !== undefined && data.order !== null) {
      formData.append('order', data.order.toString());
    }

    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('is_restaurant', data.is_restaurant ? '1' : '0');

    const response = await axiosInstance.put(apiRoutes.category.update(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteCategory: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.category.delete(id));
    return response.data;
  },
  /**
   * Persist new sort order for categories.
   * - `ordered_ids`: full array of category IDs in the desired order (no duplicates).
   * - `parent_id`: optional — restrict the reorder scope to siblings under this parent.
   */
  sortCategories: async (payload: {
    ordered_ids: number[];
    parent_id?: number | null;
  }): Promise<{
    status: boolean;
    message: string;
    data?: { updated_count: number };
  }> => {
    const body: { ordered_ids: number[]; parent_id?: number } = {
      ordered_ids: payload.ordered_ids,
    };
    if (payload.parent_id != null && payload.parent_id > 0) {
      body.parent_id = payload.parent_id;
    }
    const response = await axiosInstance.post(apiRoutes.category.sort, body);
    return response.data;
  },
};

