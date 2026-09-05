import type {
  WarrantyData,
  WarrantyListResponse,
  WarrantyDetailsResponse,
  WarrantyCreateUpdatePayload,
} from '../types/warranty.types';

import { apiRoutes, axiosInstance } from '@/api';

export type WarrantyListQueryParams = {
  page?: number;
  per_page?: number;
  /** List filter — backend key is `name`, not `search`. */
  name?: string;
  search?: string;
  is_active?: 0 | 1 | boolean;
};

const asTranslated = (
  translations: { en?: string; ar?: string } | undefined,
  value: unknown
): { en: string; ar: string } => {
  const objectValue = typeof value === 'object' && value !== null ? (value as { en?: string; ar?: string }) : null;
  const plain = typeof value === 'string' ? value : '';
  return {
    en: translations?.en ?? objectValue?.en ?? plain ?? '',
    ar: translations?.ar ?? objectValue?.ar ?? plain ?? '',
  };
};

const normalizeWarranty = (warranty: any): WarrantyData => ({
  ...warranty,
  name: asTranslated(warranty?.name_translations, warranty?.name),
  name_translations: warranty?.name_translations,
  description: asTranslated(warranty?.description_translations, warranty?.description),
  description_translations: warranty?.description_translations,
});

export const _WarrantyApi = {
  getListWarranties: async (params?: WarrantyListQueryParams): Promise<WarrantyListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    const nameFilter = (params?.name ?? params?.search)?.trim();
    if (nameFilter) searchParams.set('name', nameFilter);
    if (params?.is_active === true || params?.is_active === 1) searchParams.set('is_active', '1');
    else if (params?.is_active === false || params?.is_active === 0) searchParams.set('is_active', '0');

    const query = searchParams.toString();
    const url = query ? `${apiRoutes.warranty.list}?${query}` : apiRoutes.warranty.list;
    const response = await axiosInstance.get<WarrantyListResponse>(url);
    return {
      ...response.data,
      data: {
        ...response.data.data,
        items: (response.data.data?.items ?? []).map(normalizeWarranty),
      },
    };
  },

  getWarrantyById: async (id: number | string): Promise<WarrantyDetailsResponse> => {
    const response = await axiosInstance.get<WarrantyDetailsResponse>(apiRoutes.warranty.details(id));
    return {
      ...response.data,
      data: normalizeWarranty(response.data.data),
    };
  },

  createWarranty: async (data: WarrantyCreateUpdatePayload): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.warranty.create, data);
    return response.data;
  },

  updateWarranty: async (id: number | string, data: WarrantyCreateUpdatePayload): Promise<unknown> => {
    const response = await axiosInstance.patch(apiRoutes.warranty.update(id), data);
    return response.data;
  },

  deleteWarranty: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.warranty.delete(id));
    return response.data;
  },
};
