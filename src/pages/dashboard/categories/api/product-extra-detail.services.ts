import type {
  ProductExtraDetailListResponse,
  ProductExtraDetailDetailResponse,
  ProductExtraDetailCreateUpdatePayload,
} from '../types/product-extra-detail.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { ProductExtraDetailCreateUpdatePayload };

export type ProductExtraDetailListParams = {
  page?: number;
  per_page?: number;
  category_id?: number | string;
  search?: string;
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

export const _ProductExtraDetailApi = {
  getListProductExtraDetails: async (
    params: ProductExtraDetailListParams = {}
  ): Promise<ProductExtraDetailListResponse> => {
    const {
      page = 1,
      per_page = 25,
      category_id,
      search,
      is_active,
    } = params;
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
    if (search?.trim()) searchParams.set('search', search.trim());
    if (is_active === true || is_active === 1) searchParams.set('is_active', '1');
    else if (is_active === false || is_active === 0) searchParams.set('is_active', '0');

    const query = searchParams.toString();
    const url = query
      ? `${apiRoutes.productExtraDetail.list}?${query}`
      : apiRoutes.productExtraDetail.list;
    const response = await axiosInstance.get<ProductExtraDetailListResponse>(url);
    return response.data;
  },

  getProductExtraDetailById: async (
    id: number | string
  ): Promise<ProductExtraDetailDetailResponse> => {
    const response = await axiosInstance.get<ProductExtraDetailDetailResponse>(
      apiRoutes.productExtraDetail.details(id)
    );
    return response.data;
  },

  createProductExtraDetail: async (
    data: ProductExtraDetailCreateUpdatePayload
  ): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.productExtraDetail.create, data);
    return response.data;
  },

  updateProductExtraDetail: async (
    id: number | string,
    data: ProductExtraDetailCreateUpdatePayload
  ): Promise<unknown> => {
    const response = await axiosInstance.put(apiRoutes.productExtraDetail.update(id), data);
    return response.data;
  },

  deleteProductExtraDetail: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.productExtraDetail.delete(id));
    return response.data;
  },
};
