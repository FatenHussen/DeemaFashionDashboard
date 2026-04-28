import type {
  BrandListResponse,
  BrandDetailsResponse,
  BrandCreateUpdatePayload,
} from '../types/brand.types';

import { apiRoutes, axiosInstance } from '@/api';

export type BrandListQueryParams = {
  name?: string;
  search?: string;
  page?: number;
  per_page?: number;
  is_active?: 0 | 1 | boolean;
  category_id?: number;
  /** Sub / child category; aliases supported server-side: `child_category_id`, `second_category_id` */
  sub_category_id?: number;
  /**
   * Country filter. Server maps this to the same handling as `origin_country_id` when both exist.
   * Prefer one of `country_id` or `origin_country_id` in a single request.
   */
  country_id?: number;
  origin_country_id?: number;
  /** Inclusive `YYYY-MM-DD` on `created_at` */
  date_from?: string;
  date_to?: string;
  /** Sort field — defaults to `order` to reflect drag-and-drop sorting. */
  sort_field?: string;
  /** Sort direction — defaults to `asc` when `sort_field` is set. */
  sort_order?: 'asc' | 'desc';
};

export const _BrandApi = {
  getListBrands: async (params?: BrandListQueryParams): Promise<BrandListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.name?.trim()) searchParams.set('name', params.name.trim());
    if (params?.search?.trim()) searchParams.set('search', params.search.trim());
    if (params?.category_id != null && params.category_id > 0)
      searchParams.set('category_id', String(params.category_id));
    if (params?.sub_category_id != null && params.sub_category_id > 0)
      searchParams.set('sub_category_id', String(params.sub_category_id));
    if (params?.country_id != null && params.country_id > 0)
      searchParams.set('country_id', String(params.country_id));
    if (params?.origin_country_id != null && params.origin_country_id > 0)
      searchParams.set('origin_country_id', String(params.origin_country_id));
    if (params?.date_from?.trim()) searchParams.set('date_from', params.date_from.trim());
    if (params?.date_to?.trim()) searchParams.set('date_to', params.date_to.trim());
    if (params?.is_active === true || params?.is_active === 1) searchParams.set('is_active', '1');
    else if (params?.is_active === false || params?.is_active === 0) searchParams.set('is_active', '0');
    if (params?.sort_field) {
      searchParams.set('sort_field', params.sort_field);
      searchParams.set('sort_order', params.sort_order ?? 'asc');
    }

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
    if (data.category_ids?.length) {
      data.category_ids.forEach((cid) => {
        formData.append('category_ids[]', String(cid));
      });
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
    if (data.category_ids?.length) {
      data.category_ids.forEach((cid) => {
        formData.append('category_ids[]', String(cid));
      });
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
  /**
   * Persist new sort order for brands.
   * `ordered_ids` must be the full array of brand IDs in the desired order (no duplicates).
   */
  sortBrands: async (payload: {
    ordered_ids: number[];
  }): Promise<{
    status: boolean;
    message: string;
    data?: { updated_count: number };
  }> => {
    const response = await axiosInstance.post(apiRoutes.brand.sort, {
      ordered_ids: payload.ordered_ids,
    });
    return response.data;
  },
};
