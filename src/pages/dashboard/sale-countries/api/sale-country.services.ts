import type {
  SaleCountryCreatePayload,
  SaleCountryDetailsResponse,
  SaleCountryListItem,
  SaleCountryListNormalizedResponse,
} from '../types/sale-country.types';

import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

function normalizeListResponse(
  body: any,
  requestedPage: number,
  requestedPerPage: number
): SaleCountryListNormalizedResponse {
  const perPage = requestedPerPage;
  const page = requestedPage;

  if (Array.isArray(body?.data) && body.meta != null) {
    const total = Number(body.meta.total) || 0;
    const current = Number(body.meta.current_page) || page;
    const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);
    return {
      success: Boolean(body.success ?? body.status),
      data: {
        items: body.data as SaleCountryListItem[],
        pagination: {
          current_page: current,
          last_page: lastPage,
          per_page: perPage,
          total,
        },
      },
    };
  }

  const items = (body?.data?.items ?? []) as SaleCountryListItem[];
  const p = body?.data?.pagination;
  if (p) {
    return {
      success: Boolean(body.success ?? body.status ?? true),
      data: {
        items,
        pagination: {
          current_page: p.current_page,
          last_page: p.last_page,
          per_page: p.per_page,
          total: p.total,
        },
      },
    };
  }

  return {
    success: true,
    data: {
      items: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
      },
    },
  };
}

export const _SaleCountryApi = {
  getListSaleCountries: async (params?: {
    page?: number;
    per_page?: number;
    is_active?: number | string;
  }): Promise<SaleCountryListNormalizedResponse> => {
    const page = params?.page ?? 1;
    const perPage = params?.per_page ?? 10;
    const response = await axiosInstance.get(apiRoutes.saleCountry.list, {
      params: {
        page,
        per_page: perPage,
        ...(params?.is_active !== undefined && params.is_active !== ''
          ? { is_active: params.is_active }
          : {}),
      },
    });
    return normalizeListResponse(response.data, page, perPage);
  },

  getSaleCountryById: async (id: number | string): Promise<SaleCountryDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.saleCountry.details(id));
    return response.data;
  },

  createSaleCountry: async (data: SaleCountryCreatePayload): Promise<unknown> => {
    const formData = new FormData();
    formData.append('name[ar]', data.name.ar);
    formData.append('name[en]', data.name.en);
    if (data.icon instanceof File) formData.append('icon', data.icon);
    formData.append('is_active', data.is_active !== false ? '1' : '0');
    const response = await axiosInstance.post(apiRoutes.saleCountry.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateSaleCountry: async (
    id: number | string,
    data: Partial<SaleCountryCreatePayload>
  ): Promise<unknown> => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    if (data.name?.ar != null) formData.append('name[ar]', data.name.ar);
    if (data.name?.en != null) formData.append('name[en]', data.name.en);
    if (data.icon instanceof File) formData.append('icon', data.icon);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
    const response = await axiosInstance.post(apiRoutes.saleCountry.update(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteSaleCountry: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.saleCountry.delete(id));
    return response.data;
  },
};
