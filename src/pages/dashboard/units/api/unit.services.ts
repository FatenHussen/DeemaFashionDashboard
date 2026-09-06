import type {
  UnitData,
  UnitListResponse,
  UnitDetailsResponse,
  UnitCreateUpdatePayload,
} from '../types/unit.types';

import { apiRoutes, axiosInstance } from '@/api';

export type UnitListQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: 0 | 1 | boolean;
};

const normalizeUnit = (unit: any): UnitData => {
  const translatedName = unit?.name_translations;
  const objectName = typeof unit?.name === 'object' && unit?.name !== null ? unit.name : null;
  const plainName = typeof unit?.name === 'string' ? unit.name : '';

  return {
    ...unit,
    name: {
      en: translatedName?.en ?? objectName?.en ?? plainName ?? '',
      ar: translatedName?.ar ?? objectName?.ar ?? plainName ?? '',
    },
    name_translations: translatedName,
  };
};

export const _UnitApi = {
  getListUnits: async (params?: UnitListQueryParams): Promise<UnitListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.search?.trim()) searchParams.set('search', params.search.trim());
    if (params?.is_active === true || params?.is_active === 1) searchParams.set('is_active', '1');
    else if (params?.is_active === false || params?.is_active === 0) searchParams.set('is_active', '0');

    const query = searchParams.toString();
    const url = query ? `${apiRoutes.unit.list}?${query}` : apiRoutes.unit.list;
    const response = await axiosInstance.get<UnitListResponse>(url);
    return {
      ...response.data,
      data: {
        ...response.data.data,
        items: (response.data.data?.items ?? []).map(normalizeUnit),
      },
    };
  },

  getUnitById: async (id: number | string): Promise<UnitDetailsResponse> => {
    const response = await axiosInstance.get<UnitDetailsResponse>(apiRoutes.unit.details(id));
    return {
      ...response.data,
      data: normalizeUnit(response.data.data),
    };
  },

  createUnit: async (data: UnitCreateUpdatePayload): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.unit.create, data);
    return response.data;
  },

  updateUnit: async (id: number | string, data: UnitCreateUpdatePayload): Promise<unknown> => {
    const response = await axiosInstance.patch(apiRoutes.unit.update(id), data);
    return response.data;
  },

  deleteUnit: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.unit.delete(id));
    return response.data;
  },
};
