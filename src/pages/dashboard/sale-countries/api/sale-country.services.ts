import type {
  SaleCountryListItem,
  SaleCountryCreatePayload,
  SaleCountryDetailsResponse,
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
  const total = p?.total ?? items.length;
  const perPageResolved = p?.per_page ?? perPage;
  const current = p?.current_page ?? page;
  const lastPage = p?.last_page ?? Math.max(1, Math.ceil(total / perPageResolved) || 1);

  return {
    success: Boolean(body.success ?? body.status ?? true),
    data: {
      items,
      pagination: {
        current_page: current,
        last_page: lastPage,
        per_page: perPageResolved,
        total,
      },
    },
  };
}

export const _SaleCountryApi = {
  getListSaleCountries: async (params?: {
    page?: number;
    per_page?: number;
    is_active?: number | string;
    search?: string;
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
        ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
      },
    });
    return normalizeListResponse(response.data, page, perPage);
  },

  getSaleCountryById: async (id: number | string): Promise<SaleCountryDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.saleCountry.details(id));
    return response.data;
  },

  createSaleCountry: async (data: SaleCountryCreatePayload): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.saleCountry.create, {
      name: { ar: data.name.ar, en: data.name.en },
      is_active: data.is_active !== false,
    });
    return response.data;
  },

  updateSaleCountry: async (
    id: number | string,
    data: Partial<SaleCountryCreatePayload>
  ): Promise<unknown> => {
    const payload: Record<string, unknown> = {};
    if (data.name) payload.name = { ar: data.name.ar, en: data.name.en };
    if (data.is_active !== undefined) payload.is_active = data.is_active;
    const response = await axiosInstance.put(apiRoutes.saleCountry.update(id), payload);
    return response.data;
  },

  deleteSaleCountry: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.saleCountry.delete(id));
    return response.data;
  },
};
