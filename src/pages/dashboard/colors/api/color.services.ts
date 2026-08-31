import type {
  ColorListParams,
  ColorListResponse,
  ColorCreatePayload,
  ColorDetailsResponse,
} from '../types/color.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ColorApi = {
  getListColors: async (params?: ColorListParams): Promise<ColorListResponse> => {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 15,
    };
    if (params?.search) query.search = params.search;
    if (params?.sort_field) query.sort_field = params.sort_field;
    if (params?.sort_order) query.sort_order = params.sort_order;
    if (params?.hex) query.hex = params.hex;
    if (params?.is_active === true || params?.is_active === 1) query.is_active = '1';
    else if (params?.is_active === false || params?.is_active === 0) query.is_active = '0';

    const response = await axiosInstance.get<ColorListResponse>(apiRoutes.color.list, {
      params: query,
    });
    return response.data;
  },

  getColorById: async (id: number | string): Promise<ColorDetailsResponse> => {
    const response = await axiosInstance.get<ColorDetailsResponse>(apiRoutes.color.details(id));
    return response.data;
  },

  createColor: async (data: ColorCreatePayload): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.color.create, data);
    return response.data;
  },

  updateColor: async (
    id: number | string,
    data: Partial<ColorCreatePayload>
  ): Promise<unknown> => {
    const response = await axiosInstance.patch(apiRoutes.color.update(id), data);
    return response.data;
  },

  deleteColor: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.color.delete(id));
    return response.data;
  },
};
