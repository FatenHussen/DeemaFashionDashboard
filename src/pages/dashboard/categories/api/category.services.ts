import type {
  CategoryData,
  CategoryListResponse,
  CategoryDetailResponse,
  CategoryCreateUpdatePayload,
  CategoryLinkedItemsResponse,
  CategoryDeleteImpactResponse,
} from '../types/category.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CategoryCreateUpdatePayload };

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

/** Serialize list filter: root level uses `parent_id=null` in the query string. */
function appendParentIdParam(searchParams: URLSearchParams, parent_id: number | null | undefined) {
  if (parent_id === undefined) return;
  if (parent_id === null || parent_id === 0) {
    searchParams.set('parent_id', 'null');
  } else {
    searchParams.set('parent_id', String(parent_id));
  }
}

export const _CategoryApi = {
  getListCategories: async (parentId?: number | null): Promise<CategoryListResponse> => {
    const searchParams = new URLSearchParams();
    if (parentId !== undefined) {
      appendParentIdParam(searchParams, parentId);
    }
    const query = searchParams.toString();
    const url = query ? `${apiRoutes.category.list}?${query}` : apiRoutes.category.list;
    const response = await axiosInstance.get<CategoryListResponse>(url);
    return response.data;
  },
  getListCategoriesPaginated: async (params?: {
    page?: number;
    per_page?: number;
    /** `0` or `null` = root categories only (sent as `parent_id=null`). Omit for unfiltered list. */
    parent_id?: number | null;
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
    appendParentIdParam(searchParams, params?.parent_id);
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

  /**
   * Fetches every page of the admin category list and merges rows (deduped by id).
   * Needed for hierarchical pickers when totals exceed one page or parents/children span pages.
   */
  getListAllCategoriesFlat: async (params?: {
    per_page?: number;
    parent_id?: number | null;
    category_id?: number;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    name?: string;
    is_active?: 0 | 1 | boolean;
    is_restaurant?: 0 | 1 | boolean;
  }): Promise<CategoryData[]> => {
    const perPage = params?.per_page ?? 500;
    const first = await _CategoryApi.getListCategoriesPaginated({
      ...params,
      page: 1,
      per_page: perPage,
    });
    const byId = new Map<number, CategoryData>();
    for (const c of first.data?.items ?? []) {
      byId.set(c.id, c);
    }
    const lastPage = Math.max(1, first.data?.pagination?.last_page ?? 1);
    for (let p = 2; p <= lastPage; p++) {
      const r = await _CategoryApi.getListCategoriesPaginated({
        ...params,
        page: p,
        per_page: perPage,
      });
      for (const c of r.data?.items ?? []) {
        byId.set(c.id, c);
      }
    }
    return Array.from(byId.values());
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
  /**
   * Deletes the category. Without `confirm`, linked records yield `409`
   * (`ConfirmationRequiredError`) instead of acting — pass `confirm: true` after the user acks.
   */
  deleteCategory: async (
    id: number | string,
    options?: { confirm?: boolean }
  ): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.category.delete(id), {
      params: options?.confirm ? { confirm: true } : undefined,
    });
    return response.data;
  },
  /**
   * Preview of what the delete would affect. Best-effort: the dialog falls back to a plain
   * "are you sure?" when this is unavailable, so a failure here is not worth a toast.
   */
  getDeleteImpact: async (id: number | string): Promise<CategoryDeleteImpactResponse> => {
    const response = await axiosInstance.get<CategoryDeleteImpactResponse>(
      apiRoutes.category.deleteImpact(id),
      { skipErrorToast: true }
    );
    return response.data;
  },
  getLinkedItems: async (
    id: number | string,
    params: { page?: number; per_page?: number } = {}
  ): Promise<CategoryLinkedItemsResponse> => {
    const searchParams = new URLSearchParams();
    appendIf(searchParams, 'page', params.page ?? 1);
    appendIf(searchParams, 'per_page', params.per_page ?? 10);
    const query = searchParams.toString();
    const response = await axiosInstance.get<CategoryLinkedItemsResponse>(
      `${apiRoutes.category.linkedItems(id)}?${query}`,
      // Same as the impact preview: the tab renders its own empty state on failure.
      { skipErrorToast: true }
    );
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

